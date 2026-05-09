/**
 * Fuldmagt PDF preview v3 — pulled-back design.
 *
 * Goal: more legit and trustworthy than v1, but not screaming for trust.
 * - Big square Nordan logo (the LinkedIn green-square one)
 * - Signature block stays mostly green/techy (it was OK before — just
 *   slightly elevated, with a small "eIDAS" pill)
 * - Page 2 signing certificate goes back to the original green/techy
 *   style — small blue accent only on the verification line
 *
 * Run: node scripts/preview-fuldmagt-v3.mjs
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const NORDAN_GREEN = rgb(0x25 / 255, 0x3f / 255, 0x32 / 255);
const NORDAN_ACCENT = rgb(0xa5 / 255, 0x88 / 255, 0x78 / 255);
// Tiny dose of "official Danish digital identity" blue — only used on a
// single small badge so it reads as legit without looking marketing-y.
const ID_BLUE = rgb(0x00 / 255, 0x60 / 255, 0xe6 / 255);
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.42, 0.42);
const LINE = rgb(0.88, 0.86, 0.83);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;

async function loadLogo(pdfDoc) {
  const logoPath = path.join(ROOT, "public", "images", "logo-fuldmagt-square.png");
  const bytes = await fs.readFile(logoPath);
  return pdfDoc.embedPng(bytes);
}

async function sha256Hex(bytes) {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const hash = await webcrypto.subtle.digest("SHA-256", ab);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function drawHeader(page, logo, fontBold, font) {
  // Big square logo — h=80 (was 52)
  const logoH = 80;
  const logoW = logoH; // square
  page.drawImage(logo, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 30 - logoH,
    width: logoW,
    height: logoH,
  });

  // Right-aligned company info
  const lines = [
    ["Nordan Risk Partners ApS", fontBold, 9.5, NORDAN_GREEN],
    ["CVR-nr. 4595 3769", font, 8.5, MUTED],
    ["Toftevej 15B · 3450 Allerød", font, 8.5, MUTED],
    ["info@ndrp.dk · +45 53 52 00 06", font, 8.5, MUTED],
  ];
  let y = PAGE_HEIGHT - 40;
  for (const [text, useFont, size, color] of lines) {
    const w = useFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: PAGE_WIDTH - MARGIN_X - w,
      y,
      size,
      font: useFont,
      color,
    });
    y -= 12;
  }

  page.drawLine({
    start: { x: MARGIN_X, y: PAGE_HEIGHT - 130 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 130 },
    thickness: 0.5,
    color: LINE,
  });
}

function drawFooter(page, font, pageNumber, totalPages) {
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
  const pageStr = `Side ${pageNumber} af ${totalPages}`;
  const w = font.widthOfTextAtSize(pageStr, 8);
  page.drawText(pageStr, {
    x: PAGE_WIDTH - MARGIN_X - w,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  });
}

function newPage(ctx) {
  const page = ctx.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page, ctx.logo, ctx.fontBold, ctx.font);
  ctx.pageList.push(page);
  ctx.page = page;
  ctx.y = PAGE_HEIGHT - 165;
}

function ensureSpace(ctx, needed) {
  if (ctx.y - needed < 70) newPage(ctx);
}

function drawText(ctx, text, opts = {}) {
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

function drawBullet(ctx, text) {
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
}

function drawHr(ctx, gap = 10) {
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

function drawKv(ctx, label, value) {
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

/**
 * Closer to the ORIGINAL signature block — clean, green-themed, no big
 * blue marketing card. We add a small blue eIDAS pill for legitimacy
 * signal but keep the rest as it was.
 */
function drawSignatureBlock(ctx, signer, audit) {
  ensureSpace(ctx, 200);
  ctx.y -= 16;
  drawHr(ctx, 6);

  // "Underskrift" header with a tiny eIDAS-blue pill on the right
  drawText(ctx, "Underskrift", { size: 13, bold: true, color: NORDAN_GREEN, gap: 8 });

  // Position the pill aligned with the "Underskrift" header line we just drew
  const pillY = ctx.y + 13 * 1.5 + 2;
  const pillText = "eIDAS art. 25";
  const pillTextW = ctx.fontBold.widthOfTextAtSize(pillText, 7.5);
  const pillW = pillTextW + 14;
  const pillX = PAGE_WIDTH - MARGIN_X - pillW;
  ctx.page.drawRectangle({
    x: pillX,
    y: pillY - 4,
    width: pillW,
    height: 14,
    color: rgb(0.94, 0.97, 1),
    borderColor: ID_BLUE,
    borderWidth: 0.6,
  });
  // Tiny check inside the pill
  ctx.page.drawCircle({
    x: pillX + 5,
    y: pillY + 3,
    size: 2.5,
    color: ID_BLUE,
  });
  ctx.page.drawText(pillText, {
    x: pillX + 11,
    y: pillY,
    size: 7.5,
    font: ctx.fontBold,
    color: ID_BLUE,
  });

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
  ctx.page.drawText("Signatur:", {
    x: MARGIN_X,
    y: ctx.y,
    size: 10,
    font: ctx.fontBold,
    color: MUTED,
  });
  // Italic handwriting-style name in brand green — original look
  ctx.page.drawText(signer.name, {
    x: MARGIN_X + 110,
    y: ctx.y,
    size: 16,
    font: ctx.fontItalic,
    color: NORDAN_GREEN,
  });
  ctx.y -= 18;
  ctx.page.drawText("Underskrevet elektronisk · audit-id " + audit.auditId, {
    x: MARGIN_X + 110,
    y: ctx.y,
    size: 8,
    font: ctx.font,
    color: MUTED,
  });
  ctx.y -= 18;
}

async function buildPdf(signer, audit) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("Undersøgelsesfuldmagt — Nordan Risk Partners");
  pdfDoc.setAuthor("Nordan Risk Partners ApS");
  pdfDoc.setSubject(`Undersøgelsesfuldmagt for ${signer.companyName} (CVR ${signer.cvr})`);
  pdfDoc.setProducer("nordanriskpartners.dk");
  pdfDoc.setCreationDate(new Date());

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontMonoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const logo = await loadLogo(pdfDoc);

  const ctx = {
    page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - 165,
    pdfDoc,
    font,
    fontBold,
    fontItalic,
    fontMono,
    fontMonoBold,
    logo,
    pageList: [],
  };
  drawHeader(ctx.page, logo, fontBold, font);
  ctx.pageList.push(ctx.page);

  drawText(ctx, "Undersøgelsesfuldmagt", { size: 22, bold: true, color: NORDAN_GREEN, gap: 4 });
  drawText(ctx, "til forsikringsmægler", { size: 12, color: MUTED, gap: 18 });

  drawText(ctx, `Virksomhedsnavn: ${signer.companyName}`, { bold: true });
  drawText(ctx, `CVR-nr.: ${signer.cvr}`, { bold: true, gap: 4 });
  drawText(ctx, "(I det følgende kaldet “Fuldmagtsgiver”)", { color: MUTED, size: 9.5, gap: 14 });

  drawText(ctx, "Nordan Risk Partners ApS", { bold: true });
  drawText(ctx, "CVR-nr.: 4595 3769", { bold: true });
  drawText(ctx, "Toftevej 15B, 3450 Allerød", { bold: true, gap: 4 });
  drawText(ctx, "(I det følgende kaldet “Nordan Risk Partners”)", { color: MUTED, size: 9.5, gap: 18 });

  drawText(ctx, "Det bekræftes herved, at Fuldmagtsgiver har truffet aftale med Nordan Risk Partners om, at Nordan Risk Partners fra dags dato er udpeget som vores forsikringsmægler til undersøgelse af forsikringsmarkedet. Fuldmagten er ikke eksklusiv og erstatter ikke tidligere udstedte forsikringsmæglerfuldmagter.");
  drawText(ctx, "Denne undersøgelsesfuldmagt bemyndiger, og giver forsikringsmægleren ret til, på Fuldmagtsgivers vegne:", { gap: 8 });
  drawBullet(ctx, "at indhente oplysninger om samtlige bestående forsikringer hos enhver forsikringsdistributør, herunder forsikringspolicer, vilkår, præmier, selvbehold, samt øvrige relevante oplysninger for vurdering af eksisterende forsikringsforhold");
  drawBullet(ctx, "at indhente oplysninger om skadehistorik for alle bestående og tidligere forsikringer, herunder skadestatistikker, skadereserver, samt risikovurderinger og andre relevante data, i relation til anmeldte skader");
  drawBullet(ctx, "at afgive risikooplysninger til enhver forsikringsdistributør og indhente tilbud på forsikringer inden for alle brancher på skadesforsikringsområdet.");
  ctx.y -= 6;
  drawText(ctx, "Annullering af eksisterende forsikringer eller etablering af nye forsikringer kræver, at der gives eksklusiv forsikringsmæglerfuldmagt til Nordan Risk Partners.");
  drawText(ctx, "Fuldmagtsgiver er gjort opmærksomme på, at oplysninger, som forsikringsmægleren videregiver til forsikringsdistributører, i relation til de omhandlede forsikringer, sidestilles med oplysninger afgivet af Fuldmagtsgiver.");
  drawText(ctx, "Fuldmagtsgiver er gjort opmærksomme på, at undersøgelsesfuldmagten til enhver tid kan tilbagekaldes af Fuldmagtsgiver på samme måde, som den er indgået og at den forbliver i kraft, indtil den skriftligt tilbagekaldes, eller der indgås mæglerfuldmagt med Nordan Risk Partners. Fuldmagten ophører dog automatisk 1 år efter underskriftsdatoen, såfremt den ikke er tilbagekaldt forinden.");
  drawText(ctx, "Fuldmagtsgiver påpeger, at Fuldmagtsgiver ønsker at Fuldmagtsgivers nuværende forsikringsmægler ikke involveres eller orienteres om nærværende undersøgelsesfuldmagt.");
  drawText(ctx, "Underskriver indestår for at være berettiget til at underskrive denne undersøgelsesfuldmagt og dermed berettiget til at forpligte Fuldmagtsgiver.");

  drawSignatureBlock(ctx, signer, audit);

  // Page 2 — Signing certificate, terminal/system-log style.
  // Tech labels in monospace, hashes/IPs/UAs in monospace, structured
  // like a developer audit dump. This is the page insurance companies
  // verify against — it should read as machine-generated and authoritative.
  newPage(ctx);
  drawCertificatePage(ctx, signer, audit);

  const total = ctx.pageList.length;
  ctx.pageList.forEach((p, i) => drawFooter(p, font, i + 1, total));

  return await pdfDoc.save({ useObjectStreams: true });
}

function drawTechHeading(ctx, text) {
  ensureSpace(ctx, 22);
  ctx.page.drawText(text.toUpperCase(), {
    x: MARGIN_X,
    y: ctx.y,
    size: 9,
    font: ctx.fontMonoBold,
    color: NORDAN_GREEN,
  });
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN_X, y: ctx.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: ctx.y },
    thickness: 0.5,
    color: LINE,
  });
  ctx.y -= 12;
}

function drawTechRow(ctx, key, value, opts = {}) {
  const size = 9;
  const lineHeight = 14;
  ensureSpace(ctx, lineHeight);
  ctx.page.drawText(key, {
    x: MARGIN_X,
    y: ctx.y,
    size,
    font: ctx.fontMonoBold,
    color: MUTED,
  });
  // Wrap long monospace values across lines so hashes don't run off the page
  const valueX = MARGIN_X + 110;
  const maxValueW = PAGE_WIDTH - MARGIN_X - valueX;
  const fnt = opts.useNormalFont ? ctx.font : ctx.fontMono;
  const words = value.split(/\s+/);
  let line = "";
  let firstLine = true;
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (fnt.widthOfTextAtSize(candidate, size) > maxValueW && line) {
      ctx.page.drawText(line, {
        x: valueX,
        y: ctx.y,
        size,
        font: fnt,
        color: INK,
      });
      ctx.y -= lineHeight;
      ensureSpace(ctx, lineHeight);
      line = w;
      firstLine = false;
    } else {
      line = candidate;
    }
  }
  if (line) {
    ctx.page.drawText(line, {
      x: valueX,
      y: ctx.y,
      size,
      font: fnt,
      color: INK,
    });
    ctx.y -= lineHeight;
  }
  ctx.y -= 2;
  void firstLine;
}

function drawCertificatePage(ctx, signer, audit) {
  // Title bar — green slab + small subtitle
  drawText(ctx, "Signeringscertifikat", {
    size: 18,
    bold: true,
    color: NORDAN_GREEN,
    gap: 2,
  });
  ctx.page.drawText("$ openssl signing-receipt --algo sha256 --eidas-art-25", {
    x: MARGIN_X,
    y: ctx.y,
    size: 8.5,
    font: ctx.fontMono,
    color: MUTED,
  });
  ctx.y -= 22;

  // Hash block — emphasized like a code block
  drawTechHeading(ctx, "DOCUMENT");
  drawTechRow(ctx, "title", "Undersøgelsesfuldmagt — Nordan Risk Partners", { useNormalFont: true });
  drawTechRow(ctx, "version", "v1");
  drawTechRow(ctx, "sha256", audit.documentHash);
  drawTechRow(ctx, "format", "application/pdf");
  ctx.y -= 6;

  drawTechHeading(ctx, "SIGNER");
  drawTechRow(ctx, "name", signer.name, { useNormalFont: true });
  drawTechRow(ctx, "title", signer.title, { useNormalFont: true });
  drawTechRow(ctx, "company", signer.companyName, { useNormalFont: true });
  drawTechRow(ctx, "cvr", signer.cvr);
  drawTechRow(ctx, "email", signer.email);
  if (signer.phone) drawTechRow(ctx, "phone", signer.phone);
  ctx.y -= 6;

  drawTechHeading(ctx, "SIGNATURE");
  drawTechRow(
    ctx,
    "signed_at",
    new Date(audit.signedAt).toISOString()
  );
  drawTechRow(
    ctx,
    "tz_local",
    new Date(audit.signedAt).toLocaleString("da-DK", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Europe/Copenhagen",
    }),
    { useNormalFont: true }
  );
  drawTechRow(ctx, "ip", audit.ip);
  drawTechRow(ctx, "user_agent", audit.userAgent);
  drawTechRow(ctx, "audit_id", audit.auditId);
  drawTechRow(ctx, "consent", "read=true authorized=true eidas=true");
  ctx.y -= 6;

  drawTechHeading(ctx, "DECLARATION");
  drawText(
    ctx,
    "Underskriver bekræfter at have læst og forstået dokumentet, at være bemyndiget til at underskrive på vegne af ovennævnte virksomhed, og samtykker til elektronisk signering iht. eIDAS-forordningen (910/2014) artikel 25.",
    { size: 9.5, color: INK, gap: 6 }
  );
  drawText(
    ctx,
    "Underskrivers samtykke er bekræftet ved eksplicit afkrydsning på signeringssiden, kombineret med ovenstående identifikations- og audit-data. Dokument-hash beregnet før og efter underskrift gør senere ændringer detekterbare af modtagende forsikringsselskaber.",
    { size: 8.5, color: MUTED, gap: 6 }
  );

  ctx.y -= 8;
  // Verification footer — small monospace block
  ctx.page.drawRectangle({
    x: MARGIN_X,
    y: ctx.y - 30,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 30,
    color: rgb(0.97, 0.97, 0.95),
    borderColor: LINE,
    borderWidth: 0.5,
  });
  ctx.page.drawText("# verify", {
    x: MARGIN_X + 8,
    y: ctx.y - 12,
    size: 8,
    font: ctx.fontMonoBold,
    color: NORDAN_GREEN,
  });
  ctx.page.drawText(
    `curl https://nordanriskpartners.dk/verify -d audit_id=${audit.auditId}`,
    {
      x: MARGIN_X + 8,
      y: ctx.y - 24,
      size: 8,
      font: ctx.fontMono,
      color: INK,
    }
  );
  ctx.y -= 38;
}

async function main() {
  const signer = {
    name: "Sebastian Kolter",
    title: "Direktør",
    companyName: "Invisu ApS",
    cvr: "44129957",
    email: "sebastian@invisu.dk",
    phone: "+45 31 33 49 36",
  };
  const audit = {
    auditId: "audit-2026-05-09-7F3A2C",
    signedAt: new Date().toISOString(),
    ip: "203.0.113.42",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    documentHash: await sha256Hex(
      new TextEncoder().encode("Undersøgelsesfuldmagt-NordanRiskPartners-v1-2026-05-template-seed")
    ),
  };
  const bytes = await buildPdf(signer, audit);
  const out = path.join(__dirname, "sample-fuldmagt-v3.pdf");
  await fs.writeFile(out, bytes);
  console.log(`Wrote ${out} (${bytes.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
