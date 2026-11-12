import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

// Side 1 følger "Undersøgelsesfuldmagt - Skabelon.pdf" (Mads, nov. 2026): mål, farver og ordlyd
// er aflæst fra skabelonen. Aptos er Microsofts font; Helvetica er nærmeste indbyggede, så
// skriftstørrelserne er regnet om, så linjelængderne passer.
// Side 2 er signeringscertifikatet med audit-data (eIDAS art. 25) — det er vores, ikke skabelonens.

const hex = (h: string) => rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
const GREEN = hex("254135");
const INK = hex("1F2A30");
const MUTED = hex("6B7780");
const BOX = hex("E8EFEC");
const RULE = hex("8A9590");
const ID_BLUE = hex("0060E6");

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 62.5;
const CONTENT_W = PAGE_WIDTH - MARGIN_X * 2;
const BOTTOM = 50;

const TITLE_SIZE = 16.3;
const BODY_SIZE = 9.2;
const BODY_LH = 13.6;
const PARA_GAP = 6;
const LABEL_SIZE = 6.5;
const LABEL_TRACKING = 1.3; // spærret skrift i labels ("F U L D M A G T S G I V E R")

export type SignerData = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  companyName: string;
  cvr: string;
  /** "Vej 1, 1234 By" fra CVR-opslaget. Valgfri — udelades i boksen hvis den mangler. */
  companyAddress?: string;
  signatureDataUrl?: string;
};

export type AuditData = {
  auditId: string;
  signedAt: string;
  ip: string;
  userAgent: string;
  documentHash: string;
};

export type BuildResult = {
  pdfBytes: Uint8Array;
  finalHash: string;
};

type Fonts = { regular: PDFFont; bold: PDFFont; italic: PDFFont; mono: PDFFont; monoBold: PDFFont };
type Ctx = { doc: PDFDocument; page: PDFPage; y: number; f: Fonts; logo: PDFImage | null; pages: PDFPage[] };
type Seg = { text: string; bold?: boolean };
type Color = ReturnType<typeof rgb>;

async function loadLogo(doc: PDFDocument): Promise<PDFImage | null> {
  const logoPath = path.join(process.cwd(), "public", "images", "logo-fuldmagt-square.png");
  try {
    return await doc.embedPng(await fs.readFile(logoPath));
  } catch (err) {
    console.error("[fuldmagt-pdf] logo mangler, fortsætter uden:", err);
    return null;
  }
}

function addPage(ctx: Ctx) {
  const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  // Logo helt oppe ved kanten, flugter med højre margin (som i skabelonen).
  if (ctx.logo) {
    const h = 66;
    const w = (ctx.logo.width / ctx.logo.height) * h;
    page.drawImage(ctx.logo, { x: PAGE_WIDTH - MARGIN_X - w, y: PAGE_HEIGHT - 9 - h, width: w, height: h });
  }
  ctx.pages.push(page);
  ctx.page = page;
  ctx.y = PAGE_HEIGHT - 71; // titlens grundlinje
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y - needed < BOTTOM) {
    addPage(ctx);
    ctx.y -= 24;
  }
}

/** Spærret label i versaler. */
function drawLabel(page: PDFPage, f: Fonts, text: string, x: number, y: number, color: Color = GREEN) {
  let cx = x;
  for (const ch of text.toUpperCase()) {
    page.drawText(ch, { x: cx, y, size: LABEL_SIZE, font: f.bold, color });
    cx += f.bold.widthOfTextAtSize(ch, LABEL_SIZE) + LABEL_TRACKING;
  }
}

/** Ombryder tekst med fed/normal på ord-niveau. */
function drawRich(ctx: Ctx, segs: Seg[], opts: { x?: number; width?: number; size?: number; lh?: number; color?: Color; after?: number } = {}) {
  const x = opts.x ?? MARGIN_X;
  const width = opts.width ?? CONTENT_W;
  const size = opts.size ?? BODY_SIZE;
  const lh = opts.lh ?? BODY_LH;
  const color = opts.color ?? INK;
  const space = ctx.f.regular.widthOfTextAtSize(" ", size);

  const words = segs.flatMap((s) => s.text.split(/\s+/).filter(Boolean).map((w) => ({ w, font: s.bold ? ctx.f.bold : ctx.f.regular })));
  let line: typeof words = [];
  let lineW = 0;
  const flush = () => {
    ensureSpace(ctx, lh);
    let cx = x;
    for (const { w, font } of line) {
      ctx.page.drawText(w, { x: cx, y: ctx.y, size, font, color });
      cx += font.widthOfTextAtSize(w, size) + space;
    }
    ctx.y -= lh;
    line = [];
    lineW = 0;
  };
  for (const word of words) {
    const ww = word.font.widthOfTextAtSize(word.w, size);
    if (line.length && lineW + space + ww > width) flush();
    lineW += line.length ? space + ww : ww;
    line.push(word);
  }
  if (line.length) flush();
  ctx.y -= opts.after ?? PARA_GAP;
}

const para = (ctx: Ctx, text: string) => drawRich(ctx, [{ text }]);

function drawDashItem(ctx: Ctx, text: string) {
  ensureSpace(ctx, BODY_LH);
  ctx.page.drawText("–", { x: MARGIN_X + 2, y: ctx.y, size: BODY_SIZE, font: ctx.f.bold, color: GREEN });
  drawRich(ctx, [{ text }], { x: MARGIN_X + 18, width: CONTENT_W - 18, after: 3 });
}

/** Forkorter med … hvis teksten er bredere end feltet (lange firmanavne). */
function fitText(font: PDFFont, text: string, size: number, max: number) {
  if (font.widthOfTextAtSize(text, size) <= max) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > max) t = t.slice(0, -1);
  return `${t}…`;
}

/** De to bokse: lysegrøn flade, mørkegrøn streg i toppen, samme højde. */
function drawPartyBoxes(ctx: Ctx, signer: SignerData) {
  const gap = 14;
  const boxW = (CONTENT_W - gap) / 2;
  const pad = 10;
  const lineH = 12.8;
  const parties = [
    {
      label: "Fuldmagtsgiver",
      name: signer.companyName,
      lines: [signer.companyAddress, `CVR nr.: ${signer.cvr}`].filter((l): l is string => Boolean(l)),
      note: '(I det følgende kaldet "Fuldmagtsgiver")',
    },
    {
      label: "Forsikringsmægler",
      name: "Nordan Risk Partners ApS",
      lines: ["Toftevej 15B, 3450 Allerød", "CVR nr.: 45953769"],
      note: '(I det følgende kaldet "Nordan Risk Partners")',
    },
  ];
  const maxLines = Math.max(4, ...parties.map((p) => p.lines.length + 1));
  const boxH = 28 + maxLines * lineH + 18;
  const top = PAGE_HEIGHT - 87;

  parties.forEach((p, i) => {
    const bx = MARGIN_X + i * (boxW + gap);
    ctx.page.drawRectangle({ x: bx, y: top - boxH, width: boxW, height: boxH, color: BOX });
    ctx.page.drawRectangle({ x: bx, y: top - 2, width: boxW, height: 2, color: GREEN });
    let y = top - 15;
    drawLabel(ctx.page, ctx.f, p.label, bx + pad, y);
    y -= 14;
    ctx.page.drawText(fitText(ctx.f.bold, p.name, 9, boxW - pad * 2), { x: bx + pad, y, size: 9, font: ctx.f.bold, color: INK });
    for (const l of p.lines) {
      y -= lineH;
      ctx.page.drawText(fitText(ctx.f.regular, l, 9, boxW - pad * 2), { x: bx + pad, y, size: 9, font: ctx.f.regular, color: INK });
    }
    ctx.page.drawText(p.note, { x: bx + pad, y: top - boxH + 10, size: 7.5, font: ctx.f.italic, color: MUTED });
  });
  ctx.y = top - boxH - 28;
}

function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleString("da-DK", {
    dateStyle: "long",
    ...(withTime ? { timeStyle: "short" as const } : {}),
    timeZone: "Europe/Copenhagen",
  });
}

/** Kraftig streg, spærret overskrift og fire felter: værdi over streg, label under. */
function drawSignatureBlock(ctx: Ctx, signer: SignerData, audit: AuditData) {
  ensureSpace(ctx, 170);
  ctx.y -= 4;
  ctx.page.drawLine({ start: { x: MARGIN_X - 1, y: ctx.y }, end: { x: PAGE_WIDTH - MARGIN_X + 1, y: ctx.y }, thickness: 1.3, color: INK });
  ctx.y -= 15;
  drawLabel(ctx.page, ctx.f, "Underskrift – Fuldmagtsgiver", MARGIN_X, ctx.y, INK);

  // eIDAS-pille ud for overskriften — vores tilføjelse til skabelonen.
  const pill = "eIDAS art. 25";
  const pillW = ctx.f.bold.widthOfTextAtSize(pill, 6.5) + 15;
  const px = PAGE_WIDTH - MARGIN_X - pillW;
  ctx.page.drawRectangle({ x: px, y: ctx.y - 3.5, width: pillW, height: 12, color: hex("EFF5FF"), borderColor: ID_BLUE, borderWidth: 0.5 });
  ctx.page.drawCircle({ x: px + 5.5, y: ctx.y + 2.5, size: 2, color: ID_BLUE });
  ctx.page.drawText(pill, { x: px + 10, y: ctx.y, size: 6.5, font: ctx.f.bold, color: ID_BLUE });

  const colGap = 20;
  const colW = (CONTENT_W - colGap) / 2;
  const rows: Array<Array<[string, string, PDFFont, number, Color]>> = [
    [
      ["Navn", signer.name, ctx.f.regular, 10, INK],
      ["Dato", formatDate(audit.signedAt, true), ctx.f.regular, 10, INK],
    ],
    [
      ["Stilling / rolle (valgfrit)", signer.title, ctx.f.regular, 10, INK],
      ["Underskrift", signer.name, ctx.f.italic, 15, GREEN],
    ],
  ];
  let lineY = ctx.y - 45;
  for (const row of rows) {
    row.forEach(([label, value, font, size, color], col) => {
      const x = MARGIN_X + col * (colW + colGap);
      ctx.page.drawText(fitText(font, value, size, colW), { x, y: lineY + 6, size, font, color });
      ctx.page.drawLine({ start: { x, y: lineY }, end: { x: x + colW, y: lineY }, thickness: 0.7, color: RULE });
      ctx.page.drawText(label, { x, y: lineY - 9, size: 6.5, font: ctx.f.regular, color: MUTED });
    });
    lineY -= 65;
  }
  ctx.y = lineY + 65 - 26;
  ctx.page.drawText(`Underskrevet elektronisk af ${signer.email} · audit-id ${audit.auditId} · se signeringscertifikat`, {
    x: MARGIN_X,
    y: ctx.y,
    size: 6.5,
    font: ctx.f.regular,
    color: MUTED,
  });
  ctx.y -= 14;
}

function drawFooter(page: PDFPage, f: Fonts, n: number, total: number) {
  const parts = ["Nordan Risk Partners ApS", "Toftevej 15B, 3450 Allerød", "CVR 45953769"];
  if (total > 1) parts.push(`Side ${n} af ${total}`);
  const text = parts.join("  ·  ");
  const w = f.regular.widthOfTextAtSize(text, 6.6);
  page.drawText(text, { x: (PAGE_WIDTH - w) / 2, y: 24, size: 6.6, font: f.regular, color: MUTED });
}

// ── Side 2: signeringscertifikat ────────────────────────────────────────────

function techHeading(ctx: Ctx, text: string) {
  ensureSpace(ctx, 24);
  drawLabel(ctx.page, ctx.f, text, MARGIN_X, ctx.y);
  ctx.y -= 6;
  ctx.page.drawRectangle({ x: MARGIN_X, y: ctx.y, width: CONTENT_W, height: 0.8, color: GREEN });
  ctx.y -= 13;
}

function techRow(ctx: Ctx, key: string, value: string, plain = false) {
  const size = 8.5;
  const lh = 13;
  const vx = MARGIN_X + 104;
  const font = plain ? ctx.f.regular : ctx.f.mono;
  ensureSpace(ctx, lh);
  ctx.page.drawText(key, { x: MARGIN_X, y: ctx.y, size, font: ctx.f.monoBold, color: MUTED });
  let line = "";
  for (const w of value.split(/\s+/)) {
    const cand = line ? `${line} ${w}` : w;
    if (line && font.widthOfTextAtSize(cand, size) > PAGE_WIDTH - MARGIN_X - vx) {
      ctx.page.drawText(line, { x: vx, y: ctx.y, size, font, color: INK });
      ctx.y -= lh;
      ensureSpace(ctx, lh);
      line = w;
    } else line = cand;
  }
  if (line) ctx.page.drawText(line, { x: vx, y: ctx.y, size, font, color: INK });
  ctx.y -= lh + 1;
}

function drawCertificatePage(ctx: Ctx, signer: SignerData, audit: AuditData) {
  ctx.page.drawText("Signeringscertifikat", { x: MARGIN_X, y: ctx.y, size: TITLE_SIZE, font: ctx.f.bold, color: GREEN });
  ctx.y -= 15;
  ctx.page.drawText("Elektronisk underskrift iht. eIDAS-forordningen (910/2014) art. 25 · SHA-256", {
    x: MARGIN_X,
    y: ctx.y,
    size: 8.5,
    font: ctx.f.regular,
    color: MUTED,
  });
  ctx.y -= 30;

  techHeading(ctx, "Dokument");
  techRow(ctx, "title", "Undersøgelsesfuldmagt til forsikringsmægler — Nordan Risk Partners", true);
  techRow(ctx, "version", "v2");
  techRow(ctx, "sha256", audit.documentHash);
  techRow(ctx, "format", "application/pdf");
  ctx.y -= 8;

  techHeading(ctx, "Underskriver");
  techRow(ctx, "name", signer.name, true);
  if (signer.title) techRow(ctx, "title", signer.title, true);
  techRow(ctx, "company", signer.companyName, true);
  techRow(ctx, "cvr", signer.cvr);
  if (signer.companyAddress) techRow(ctx, "address", signer.companyAddress, true);
  techRow(ctx, "email", signer.email);
  if (signer.phone) techRow(ctx, "phone", signer.phone);
  ctx.y -= 8;

  techHeading(ctx, "Signatur");
  techRow(ctx, "signed_at", new Date(audit.signedAt).toISOString());
  techRow(
    ctx,
    "tz_local",
    new Date(audit.signedAt).toLocaleString("da-DK", { dateStyle: "full", timeStyle: "long", timeZone: "Europe/Copenhagen" }),
    true
  );
  techRow(ctx, "ip", audit.ip);
  techRow(ctx, "user_agent", audit.userAgent);
  techRow(ctx, "audit_id", audit.auditId);
  techRow(ctx, "consent", "read=true authorized=true eidas=true");
  ctx.y -= 8;

  techHeading(ctx, "Erklæring");
  para(
    ctx,
    "Underskriver bekræfter at have læst og forstået dokumentet, at være bemyndiget til at underskrive på vegne af ovennævnte virksomhed, og samtykker til elektronisk signering iht. eIDAS-forordningen (910/2014) artikel 25."
  );
  drawRich(
    ctx,
    [
      {
        text: "Underskrivers samtykke er bekræftet ved eksplicit afkrydsning på signeringssiden, kombineret med ovenstående identifikations- og audit-data. Dokument-hash beregnet før og efter underskrift gør senere ændringer detekterbare af modtagende forsikringsselskaber.",
      },
    ],
    { size: 8.5, lh: 12.5, color: MUTED }
  );
}

// ── Byg ──────────────────────────────────────────────────────────────────────

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const hash = await crypto.subtle.digest("SHA-256", ab);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildSignedFuldmagtPdf(signer: SignerData, audit: AuditData): Promise<BuildResult> {
  const doc = await PDFDocument.create();
  doc.setTitle("Undersøgelsesfuldmagt til forsikringsmægler — Nordan Risk Partners");
  doc.setAuthor("Nordan Risk Partners ApS");
  doc.setSubject(`Undersøgelsesfuldmagt for ${signer.companyName} (CVR ${signer.cvr})`);
  doc.setProducer("nordanriskpartners.dk");
  doc.setCreationDate(new Date());

  const f: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    mono: await doc.embedFont(StandardFonts.Courier),
    monoBold: await doc.embedFont(StandardFonts.CourierBold),
  };
  const ctx = { doc, f, logo: await loadLogo(doc), pages: [] as PDFPage[], y: 0 } as unknown as Ctx;
  addPage(ctx);

  ctx.page.drawText("Undersøgelsesfuldmagt til forsikringsmægler", { x: MARGIN_X, y: ctx.y, size: TITLE_SIZE, font: f.bold, color: GREEN });
  drawPartyBoxes(ctx, signer);

  para(
    ctx,
    "Det bekræftes herved, at Fuldmagtsgiver har truffet aftale med Nordan Risk Partners om, at Nordan Risk Partners fra dags dato er udpeget som vores forsikringsmægler til undersøgelse af forsikringsmarkedet. Fuldmagten er ikke eksklusiv og erstatter ikke tidligere udstedte forsikringsmæglerfuldmagter."
  );
  drawRich(ctx, [{ text: "Denne undersøgelsesfuldmagt bemyndiger, og giver forsikringsmægleren ret til, på Fuldmagtsgivers vegne:" }], { after: 4 });
  drawDashItem(
    ctx,
    "at indhente oplysninger om samtlige bestående forsikringer hos enhver forsikringsdistributør, herunder forsikringspolicer, vilkår, præmier, selvbehold, samt øvrige relevante oplysninger for vurdering af eksisterende forsikringsforhold"
  );
  drawDashItem(
    ctx,
    "at indhente oplysninger om skadehistorik for alle bestående og tidligere forsikringer, herunder skadestatistikker, skadereserver, samt risikovurderinger og andre relevante data, i relation til anmeldte skader"
  );
  drawDashItem(
    ctx,
    "at afgive risikooplysninger til enhver forsikringsdistributør og indhente tilbud på forsikringer inden for alle brancher på skadesforsikringsområdet."
  );
  ctx.y -= 4;
  para(ctx, "Annullering af eksisterende forsikringer eller etablering af nye forsikringer kræver, at der gives eksklusiv forsikringsmæglerfuldmagt til Nordan Risk Partners.");
  para(
    ctx,
    "Fuldmagtsgiver er gjort opmærksom på, at oplysninger, som forsikringsmægleren videregiver til forsikringsdistributører, i relation til de omhandlede forsikringer, sidestilles med oplysninger afgivet af Fuldmagtsgiver."
  );
  para(
    ctx,
    "Fuldmagtsgiver er gjort opmærksom på, at undersøgelsesfuldmagten til enhver tid kan tilbagekaldes af Fuldmagtsgiver på samme måde, som den er indgået, og at den forbliver i kraft, indtil den skriftligt tilbagekaldes, eller der indgås mæglerfuldmagt med Nordan Risk Partners. Fuldmagten ophører dog automatisk 1 år efter underskriftsdatoen, såfremt den ikke er tilbagekaldt forinden."
  );
  drawRich(ctx, [
    { text: "Fuldmagtsgiver påpeger, at Fuldmagtsgiver ønsker, at Fuldmagtsgivers nuværende forsikringsmægler" },
    { text: "ikke", bold: true },
    { text: "involveres eller orienteres om nærværende undersøgelsesfuldmagt." },
  ]);
  para(ctx, "Underskriver indestår for at være berettiget til at underskrive denne undersøgelsesfuldmagt og dermed berettiget til at forpligte Fuldmagtsgiver.");

  drawSignatureBlock(ctx, signer, audit);

  addPage(ctx);
  drawCertificatePage(ctx, signer, audit);

  ctx.pages.forEach((p, i) => drawFooter(p, f, i + 1, ctx.pages.length));

  const pdfBytes = await doc.save({ useObjectStreams: true });
  return { pdfBytes, finalHash: await sha256Hex(pdfBytes) };
}

export async function computeOriginalHash(): Promise<string> {
  // v2: skabelonens ordlyd (nov. 2026).
  const seed = "Undersøgelsesfuldmagt-NordanRiskPartners-v2-2026-11-template-seed";
  return sha256Hex(new TextEncoder().encode(seed));
}
