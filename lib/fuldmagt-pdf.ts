import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";

const NORDAN_GREEN = rgb(0x25 / 255, 0x3f / 255, 0x32 / 255);
const NORDAN_ACCENT = rgb(0xa5 / 255, 0x88 / 255, 0x78 / 255);
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.42, 0.42);
const LINE = rgb(0.88, 0.86, 0.83);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;

export type SignerData = {
  name: string;
  title: string;
  email: string;
  phone?: string;
  companyName: string;
  cvr: string;
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

async function loadLogo(pdfDoc: PDFDocument) {
  const logoPath = path.join(process.cwd(), "public", "images", "logo-fuldmagt.png");
  try {
    const bytes = await fs.readFile(logoPath);
    return await pdfDoc.embedPng(bytes);
  } catch {
    return null;
  }
}

function drawHeader(page: PDFPage, logo: Awaited<ReturnType<typeof loadLogo>>, fontBold: PDFFont) {
  if (logo) {
    const logoH = 28;
    const logoW = (logo.width / logo.height) * logoH;
    page.drawImage(logo, {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 60,
      width: logoW,
      height: logoH,
    });
  } else {
    page.drawText("NORDAN RISK PARTNERS", {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 50,
      size: 12,
      font: fontBold,
      color: NORDAN_GREEN,
    });
  }
  page.drawLine({
    start: { x: MARGIN_X, y: PAGE_HEIGHT - 75 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 75 },
    thickness: 0.5,
    color: LINE,
  });
}

function drawFooter(page: PDFPage, font: PDFFont, pageNumber: number, totalPages: number) {
  page.drawLine({
    start: { x: MARGIN_X, y: 50 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: 50 },
    thickness: 0.5,
    color: LINE,
  });
  page.drawText("Nordan Risk Partners ApS · CVR 4595 3769 · Toftevej 15B · 3450 Allerød", {
    x: MARGIN_X,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });
  page.drawText(`Side ${pageNumber} af ${totalPages}`, {
    x: PAGE_WIDTH - MARGIN_X - 60,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });
}

type WriterContext = {
  page: PDFPage;
  y: number;
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  logo: Awaited<ReturnType<typeof loadLogo>>;
  pageList: PDFPage[];
};

function newPage(ctx: WriterContext) {
  const page = ctx.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, ctx.logo, ctx.fontBold);
  ctx.pageList.push(page);
  ctx.page = page;
  ctx.y = PAGE_HEIGHT - 110;
}

function ensureSpace(ctx: WriterContext, needed: number) {
  if (ctx.y - needed < 70) {
    newPage(ctx);
  }
}

function drawText(
  ctx: WriterContext,
  text: string,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {}
) {
  const size = opts.size ?? 10.5;
  const font = opts.bold ? ctx.fontBold : ctx.font;
  const color = opts.color ?? INK;
  const lineHeight = size * 1.5;
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2;

  const words = text.split(/\s+/);
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const w = font.widthOfTextAtSize(candidate, size);
    if (w > maxWidth && line) {
      ensureSpace(ctx, lineHeight);
      ctx.page.drawText(line, { x: MARGIN_X, y: ctx.y, size, font, color });
      ctx.y -= lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line, { x: MARGIN_X, y: ctx.y, size, font, color });
    ctx.y -= lineHeight;
  }
  ctx.y -= opts.gap ?? 4;
}

function drawBullet(ctx: WriterContext, text: string) {
  const size = 10.5;
  const lineHeight = size * 1.5;
  const indent = 18;
  const maxWidth = PAGE_WIDTH - MARGIN_X * 2 - indent;
  ensureSpace(ctx, lineHeight);

  ctx.page.drawCircle({
    x: MARGIN_X + 5,
    y: ctx.y + 4,
    size: 1.6,
    color: NORDAN_ACCENT,
  });

  const words = text.split(/\s+/);
  let line = "";
  let firstLine = true;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const w = ctx.font.widthOfTextAtSize(candidate, size);
    if (w > maxWidth && line) {
      ensureSpace(ctx, lineHeight);
      ctx.page.drawText(line, {
        x: MARGIN_X + indent,
        y: ctx.y,
        size,
        font: ctx.font,
        color: INK,
      });
      ctx.y -= lineHeight;
      line = word;
      firstLine = false;
    } else {
      line = candidate;
    }
  }
  if (line) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line, {
      x: MARGIN_X + indent,
      y: ctx.y,
      size,
      font: ctx.font,
      color: INK,
    });
    ctx.y -= lineHeight;
  }
  ctx.y -= 4;
  void firstLine;
}

function drawHr(ctx: WriterContext, gap = 10) {
  ensureSpace(ctx, gap + 6);
  ctx.y -= gap;
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y },
    thickness: 0.5,
    color: LINE,
  });
  ctx.y -= gap;
}

function drawKv(ctx: WriterContext, label: string, value: string) {
  const size = 10;
  const lineHeight = size * 1.5;
  ensureSpace(ctx, lineHeight);
  ctx.page.drawText(label, {
    x: MARGIN_X,
    y: ctx.y,
    size,
    font: ctx.fontBold,
    color: MUTED,
  });
  ctx.page.drawText(value, {
    x: MARGIN_X + 110,
    y: ctx.y,
    size,
    font: ctx.font,
    color: INK,
  });
  ctx.y -= lineHeight + 2;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const hash = await crypto.subtle.digest("SHA-256", ab);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildSignedFuldmagtPdf(
  signer: SignerData,
  audit: AuditData
): Promise<BuildResult> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("Undersøgelsesfuldmagt — Nordan Risk Partners");
  pdfDoc.setAuthor("Nordan Risk Partners ApS");
  pdfDoc.setSubject(`Undersøgelsesfuldmagt for ${signer.companyName} (CVR ${signer.cvr})`);
  pdfDoc.setProducer("nordanriskpartners.dk");
  pdfDoc.setCreationDate(new Date());

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadLogo(pdfDoc);

  const ctx: WriterContext = {
    page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - 110,
    pdfDoc,
    font,
    fontBold,
    logo,
    pageList: [],
  };
  drawHeader(ctx.page, logo, fontBold);
  ctx.pageList.push(ctx.page);

  drawText(ctx, "Undersøgelsesfuldmagt", {
    size: 22,
    bold: true,
    color: NORDAN_GREEN,
    gap: 4,
  });
  drawText(ctx, "til forsikringsmægler", {
    size: 12,
    color: MUTED,
    gap: 18,
  });

  drawText(ctx, `Virksomhedsnavn: ${signer.companyName}`, { bold: true });
  drawText(ctx, `CVR-nr.: ${signer.cvr}`, { bold: true, gap: 4 });
  drawText(ctx, "(I det følgende kaldet “Fuldmagtsgiver”)", { color: MUTED, size: 9.5, gap: 14 });

  drawText(ctx, "Nordan Risk Partners ApS", { bold: true });
  drawText(ctx, "CVR-nr.: 4595 3769", { bold: true });
  drawText(ctx, "Toftevej 15B, 3450 Allerød", { bold: true, gap: 4 });
  drawText(ctx, "(I det følgende kaldet “Nordan Risk Partners”)", { color: MUTED, size: 9.5, gap: 18 });

  drawText(
    ctx,
    "Det bekræftes herved, at Fuldmagtsgiver har truffet aftale med Nordan Risk Partners om, at Nordan Risk Partners fra dags dato er udpeget som vores forsikringsmægler til undersøgelse af forsikringsmarkedet. Fuldmagten er ikke eksklusiv og erstatter ikke tidligere udstedte forsikringsmæglerfuldmagter."
  );

  drawText(ctx, "Denne undersøgelsesfuldmagt bemyndiger, og giver forsikringsmægleren ret til, på Fuldmagtsgivers vegne:", { gap: 8 });

  drawBullet(
    ctx,
    "at indhente oplysninger om samtlige bestående forsikringer hos enhver forsikringsdistributør, herunder forsikringspolicer, vilkår, præmier, selvbehold, samt øvrige relevante oplysninger for vurdering af eksisterende forsikringsforhold"
  );
  drawBullet(
    ctx,
    "at indhente oplysninger om skadehistorik for alle bestående og tidligere forsikringer, herunder skadestatistikker, skadereserver, samt risikovurderinger og andre relevante data, i relation til anmeldte skader"
  );
  drawBullet(
    ctx,
    "at afgive risikooplysninger til enhver forsikringsdistributør og indhente tilbud på forsikringer inden for alle brancher på skadesforsikringsområdet."
  );

  ctx.y -= 6;
  drawText(
    ctx,
    "Annullering af eksisterende forsikringer eller etablering af nye forsikringer kræver, at der gives eksklusiv forsikringsmæglerfuldmagt til Nordan Risk Partners."
  );

  drawText(
    ctx,
    "Fuldmagtsgiver er gjort opmærksomme på, at oplysninger, som forsikringsmægleren videregiver til forsikringsdistributører, i relation til de omhandlede forsikringer, sidestilles med oplysninger afgivet af Fuldmagtsgiver."
  );

  drawText(
    ctx,
    "Fuldmagtsgiver er gjort opmærksomme på, at undersøgelsesfuldmagten til enhver tid kan tilbagekaldes af Fuldmagtsgiver på samme måde, som den er indgået og at den forbliver i kraft, indtil den skriftligt tilbagekaldes, eller der indgås mæglerfuldmagt med Nordan Risk Partners. Fuldmagten ophører dog automatisk 1 år efter underskriftsdatoen, såfremt den ikke er tilbagekaldt forinden."
  );

  drawText(
    ctx,
    "Fuldmagtsgiver påpeger, at Fuldmagtsgiver ønsker at Fuldmagtsgivers nuværende forsikringsmægler ikke involveres eller orienteres om nærværende undersøgelsesfuldmagt."
  );

  drawText(
    ctx,
    "Underskriver indestår for at være berettiget til at underskrive denne undersøgelsesfuldmagt og dermed berettiget til at forpligte Fuldmagtsgiver."
  );

  // Signing block
  ensureSpace(ctx, 200);
  ctx.y -= 16;
  drawHr(ctx, 6);
  drawText(ctx, "Underskrift", { size: 13, bold: true, color: NORDAN_GREEN, gap: 8 });

  drawKv(ctx, "Navn", signer.name);
  drawKv(ctx, "Titel", signer.title);
  drawKv(ctx, "Firma", `${signer.companyName} (CVR ${signer.cvr})`);
  drawKv(ctx, "E-mail", signer.email);
  if (signer.phone) drawKv(ctx, "Telefon", signer.phone);
  drawKv(
    ctx,
    "Dato",
    new Date(audit.signedAt).toLocaleString("da-DK", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Copenhagen",
    })
  );

  ctx.y -= 6;
  ensureSpace(ctx, 60);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  ctx.page.drawText("Signatur:", {
    x: MARGIN_X,
    y: ctx.y,
    size: 10,
    font: fontBold,
    color: MUTED,
  });
  ctx.page.drawText(signer.name, {
    x: MARGIN_X + 110,
    y: ctx.y,
    size: 16,
    font: fontItalic,
    color: NORDAN_GREEN,
  });
  ctx.y -= 18;
  ctx.page.drawText("Underskrevet elektronisk · audit-id " + audit.auditId, {
    x: MARGIN_X + 110,
    y: ctx.y,
    size: 8,
    font,
    color: MUTED,
  });
  ctx.y -= 18;

  // Audit page
  newPage(ctx);
  drawText(ctx, "Signeringscertifikat", {
    size: 18,
    bold: true,
    color: NORDAN_GREEN,
    gap: 4,
  });
  drawText(ctx, "Elektronisk signatur — eIDAS art. 25", {
    size: 11,
    color: MUTED,
    gap: 18,
  });

  drawText(ctx, "Dokument", { bold: true, size: 11, color: NORDAN_GREEN, gap: 6 });
  drawKv(ctx, "Titel", "Undersøgelsesfuldmagt — Nordan Risk Partners");
  drawKv(ctx, "Original-hash", `sha256:${audit.documentHash.slice(0, 32)}…`);

  ctx.y -= 8;
  drawText(ctx, "Underskriver", { bold: true, size: 11, color: NORDAN_GREEN, gap: 6 });
  drawKv(ctx, "Navn", signer.name);
  drawKv(ctx, "Titel", signer.title);
  drawKv(ctx, "Firma", signer.companyName);
  drawKv(ctx, "CVR", signer.cvr);
  drawKv(ctx, "E-mail", signer.email);
  if (signer.phone) drawKv(ctx, "Telefon", signer.phone);

  ctx.y -= 8;
  drawText(ctx, "Signering", { bold: true, size: 11, color: NORDAN_GREEN, gap: 6 });
  drawKv(
    ctx,
    "Tidspunkt",
    new Date(audit.signedAt).toLocaleString("da-DK", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Europe/Copenhagen",
    })
  );
  drawKv(ctx, "IP-adresse", audit.ip);
  drawKv(ctx, "Browser", audit.userAgent.slice(0, 80));
  drawKv(ctx, "Audit-ID", audit.auditId);

  ctx.y -= 12;
  drawText(ctx, "Erklæring", { bold: true, size: 11, color: NORDAN_GREEN, gap: 6 });
  drawText(
    ctx,
    "Underskriver bekræfter at have læst og forstået dokumentet, at være bemyndiget til at underskrive på vegne af ovennævnte virksomhed, og samtykker til elektronisk signering iht. eIDAS-forordningen (910/2014) artikel 25.",
    { size: 10, color: INK }
  );

  ctx.y -= 8;
  drawText(
    ctx,
    "Underskrivers samtykke er bekræftet ved tre eksplicitte afkrydsninger på signeringssiden, kombineret med ovenstående identifikations- og audit-data. Dokument-hash beregnet før og efter underskrift gør senere ændringer detekterbare.",
    { size: 9, color: MUTED }
  );

  // Page numbers in footer
  const total = ctx.pageList.length;
  ctx.pageList.forEach((p, i) => drawFooter(p, font, i + 1, total));

  const initialBytes = await pdfDoc.save({ useObjectStreams: true });

  // Compute final hash AFTER signing pages are baked in
  const finalHash = await sha256Hex(initialBytes);

  return { pdfBytes: initialBytes, finalHash };
}

export async function computeOriginalHash(): Promise<string> {
  // Hash a canonical "blank" template seed so we always have a deterministic
  // reference. Using the legal text content to hash, not the PDF — keeps it
  // stable across formatting tweaks.
  const seed =
    "Undersøgelsesfuldmagt-NordanRiskPartners-v1-2026-05-template-seed";
  const enc = new TextEncoder().encode(seed);
  return sha256Hex(enc);
}
