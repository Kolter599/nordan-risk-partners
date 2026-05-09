/**
 * Generates a preview PDF showing the proposed redesign of the
 * Undersøgelsesfuldmagt — bigger logo, blue MitID-style signature
 * verification block, more "legitimate" feel for insurance companies.
 *
 * Run: node scripts/preview-fuldmagt-v2.mjs
 * Output: scripts/sample-fuldmagt-v2.pdf
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webcrypto } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// Brand
const NORDAN_GREEN = rgb(0x25 / 255, 0x3f / 255, 0x32 / 255);
const NORDAN_ACCENT = rgb(0xa5 / 255, 0x88 / 255, 0x78 / 255);
// "Verified by official Danish digital identity" blue — same family
// users associate with MitID, NemID and Penneo.
const VERIFIED_BLUE = rgb(0x00 / 255, 0x60 / 255, 0xe6 / 255);
const VERIFIED_BLUE_SOFT = rgb(0xe6 / 255, 0xef / 255, 0xfd / 255);
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.42, 0.42);
const LINE = rgb(0.88, 0.86, 0.83);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 56;

async function loadLogo(pdfDoc) {
  const logoPath = path.join(ROOT, "public", "images", "logo-fuldmagt.png");
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
  // Bigger logo — h=80 instead of 52
  const logoH = 80;
  const logoW = (logo.width / logo.height) * logoH;
  page.drawImage(logo, {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 40 - logoH,
    width: logoW,
    height: logoH,
  });

  // Right-aligned company info
  const lines = [
    "Nordan Risk Partners ApS",
    "CVR-nr. 4595 3769",
    "Toftevej 15B · 3450 Allerød",
    "info@ndrp.dk · +45 53 52 00 06",
  ];
  let y = PAGE_HEIGHT - 50;
  for (const line of lines) {
    const isFirst = lines.indexOf(line) === 0;
    const useFont = isFirst ? fontBold : font;
    const size = isFirst ? 9.5 : 8.5;
    const w = useFont.widthOfTextAtSize(line, size);
    page.drawText(line, {
      x: PAGE_WIDTH - MARGIN_X - w,
      y,
      size,
      font: useFont,
      color: isFirst ? NORDAN_GREEN : MUTED,
    });
    y -= 12;
  }

  // Divider
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

function drawKv(ctx, label, value, opts = {}) {
  const size = 10;
  const lineHeight = size * 1.5;
  ensureSpace(ctx, lineHeight);
  ctx.page.drawText(label, {
    x: opts.x ?? MARGIN_X,
    y: ctx.y,
    size,
    font: ctx.fontBold,
    color: opts.labelColor ?? MUTED,
  });
  ctx.page.drawText(value, {
    x: (opts.x ?? MARGIN_X) + (opts.labelWidth ?? 90),
    y: ctx.y,
    size,
    font: ctx.font,
    color: opts.valueColor ?? INK,
  });
  ctx.y -= lineHeight + 2;
}

/**
 * The big change: a card-style signature box with a blue verification header,
 * MitID/Penneo-style. Two columns: signer details (left) and signature +
 * verification stamp (right).
 */
function drawSignatureCard(ctx, signer, audit) {
  ensureSpace(ctx, 240);
  ctx.y -= 12;

  const cardX = MARGIN_X;
  const cardW = PAGE_WIDTH - MARGIN_X * 2;
  const cardTop = ctx.y;
  const headerH = 28;

  // Header bar — blue with "Elektronisk underskrift · eIDAS art. 25"
  ctx.page.drawRectangle({
    x: cardX,
    y: cardTop - headerH,
    width: cardW,
    height: headerH,
    color: VERIFIED_BLUE,
  });

  // White checkmark circle on the left of the header
  ctx.page.drawCircle({
    x: cardX + 14,
    y: cardTop - headerH / 2,
    size: 7,
    color: rgb(1, 1, 1),
  });
  // Blue checkmark inside (drawn as a tick using two lines)
  ctx.page.drawLine({
    start: { x: cardX + 11, y: cardTop - headerH / 2 - 1 },
    end: { x: cardX + 13.5, y: cardTop - headerH / 2 - 4 },
    thickness: 1.4,
    color: VERIFIED_BLUE,
  });
  ctx.page.drawLine({
    start: { x: cardX + 13.5, y: cardTop - headerH / 2 - 4 },
    end: { x: cardX + 18, y: cardTop - headerH / 2 + 2.5 },
    thickness: 1.4,
    color: VERIFIED_BLUE,
  });

  ctx.page.drawText("ELEKTRONISK UNDERSKRIFT  ·  EIDAS ART. 25", {
    x: cardX + 28,
    y: cardTop - headerH / 2 - 4,
    size: 9,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });

  // "VERIFICERET" badge on the right
  const badge = "VERIFICERET";
  const badgeW = ctx.fontBold.widthOfTextAtSize(badge, 8) + 16;
  ctx.page.drawRectangle({
    x: cardX + cardW - badgeW - 10,
    y: cardTop - headerH + 6,
    width: badgeW,
    height: 16,
    color: rgb(1, 1, 1),
    opacity: 1,
  });
  ctx.page.drawText(badge, {
    x: cardX + cardW - badgeW - 10 + 8,
    y: cardTop - headerH + 11,
    size: 8,
    font: ctx.fontBold,
    color: VERIFIED_BLUE,
  });

  // Card body
  const bodyTop = cardTop - headerH;
  const bodyH = 175;
  ctx.page.drawRectangle({
    x: cardX,
    y: bodyTop - bodyH,
    width: cardW,
    height: bodyH,
    borderColor: VERIFIED_BLUE,
    borderWidth: 1.2,
  });

  // Two columns inside the card
  const colGap = 16;
  const colW = (cardW - colGap) / 2;
  const colLeft = cardX + 16;
  const colRight = cardX + colW + colGap + 4;

  // LEFT COLUMN — signer info
  let yL = bodyTop - 18;
  ctx.page.drawText("UNDERSKRIVER", {
    x: colLeft,
    y: yL,
    size: 8,
    font: ctx.fontBold,
    color: VERIFIED_BLUE,
  });
  yL -= 18;

  const signerLines = [
    [signer.name, ctx.fontBold, 12, INK],
    [signer.title, ctx.font, 10, MUTED],
    [signer.companyName, ctx.fontBold, 10, INK],
    [`CVR-nr. ${signer.cvr}`, ctx.font, 9, MUTED],
    [signer.email, ctx.font, 9, MUTED],
  ];
  if (signer.phone) signerLines.push([signer.phone, ctx.font, 9, MUTED]);

  for (const [text, fnt, size, color] of signerLines) {
    ctx.page.drawText(text, { x: colLeft, y: yL, size, font: fnt, color });
    yL -= size * 1.5;
  }

  // Vertical divider between columns
  ctx.page.drawLine({
    start: { x: cardX + colW + colGap / 2 + 4, y: bodyTop - 16 },
    end: { x: cardX + colW + colGap / 2 + 4, y: bodyTop - bodyH + 16 },
    thickness: 0.5,
    color: LINE,
  });

  // RIGHT COLUMN — actual signature + audit
  let yR = bodyTop - 18;
  ctx.page.drawText("UNDERSKRIFT", {
    x: colRight,
    y: yR,
    size: 8,
    font: ctx.fontBold,
    color: VERIFIED_BLUE,
  });
  yR -= 26;

  // The signature itself — italic, in blue, larger
  ctx.page.drawText(signer.name, {
    x: colRight,
    y: yR,
    size: 18,
    font: ctx.fontItalic,
    color: VERIFIED_BLUE,
  });
  yR -= 14;

  // Underline for signature
  const sigW = ctx.fontItalic.widthOfTextAtSize(signer.name, 18);
  ctx.page.drawLine({
    start: { x: colRight, y: yR + 4 },
    end: { x: colRight + Math.max(sigW + 30, 180), y: yR + 4 },
    thickness: 0.6,
    color: VERIFIED_BLUE,
  });
  yR -= 16;

  // Date + audit
  const signedDate = new Date(audit.signedAt).toLocaleString("da-DK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });
  ctx.page.drawText("Underskrevet:", {
    x: colRight,
    y: yR,
    size: 8,
    font: ctx.fontBold,
    color: MUTED,
  });
  ctx.page.drawText(signedDate, {
    x: colRight + 70,
    y: yR,
    size: 8,
    font: ctx.font,
    color: INK,
  });
  yR -= 12;
  ctx.page.drawText("Audit-ID:", {
    x: colRight,
    y: yR,
    size: 8,
    font: ctx.fontBold,
    color: MUTED,
  });
  ctx.page.drawText(audit.auditId, {
    x: colRight + 70,
    y: yR,
    size: 8,
    font: ctx.fontMono,
    color: INK,
  });
  yR -= 12;
  ctx.page.drawText("IP-adresse:", {
    x: colRight,
    y: yR,
    size: 8,
    font: ctx.fontBold,
    color: MUTED,
  });
  ctx.page.drawText(audit.ip, {
    x: colRight + 70,
    y: yR,
    size: 8,
    font: ctx.fontMono,
    color: INK,
  });

  // Soft blue-tinted strip at bottom of card with explanatory text
  const stripH = 22;
  ctx.page.drawRectangle({
    x: cardX,
    y: bodyTop - bodyH,
    width: cardW,
    height: stripH,
    color: VERIFIED_BLUE_SOFT,
  });
  ctx.page.drawText(
    "Underskriften er bundet til ovenstående audit-data. Dokumentet er hash-sealed efter underskrift — enhver ændring vil blive detekteret.",
    {
      x: cardX + 14,
      y: bodyTop - bodyH + 8,
      size: 7.5,
      font: ctx.font,
      color: MUTED,
    }
  );

  ctx.y = bodyTop - bodyH - 8;
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
  const logo = await loadLogo(pdfDoc);

  const ctx = {
    page: pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - 165,
    pdfDoc,
    font,
    fontBold,
    fontItalic,
    fontMono,
    logo,
    pageList: [],
  };
  drawHeader(ctx.page, logo, fontBold, font);
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

  drawBullet(ctx, "at indhente oplysninger om samtlige bestående forsikringer hos enhver forsikringsdistributør, herunder forsikringspolicer, vilkår, præmier, selvbehold, samt øvrige relevante oplysninger for vurdering af eksisterende forsikringsforhold");
  drawBullet(ctx, "at indhente oplysninger om skadehistorik for alle bestående og tidligere forsikringer, herunder skadestatistikker, skadereserver, samt risikovurderinger og andre relevante data, i relation til anmeldte skader");
  drawBullet(ctx, "at afgive risikooplysninger til enhver forsikringsdistributør og indhente tilbud på forsikringer inden for alle brancher på skadesforsikringsområdet.");

  ctx.y -= 6;
  drawText(ctx, "Annullering af eksisterende forsikringer eller etablering af nye forsikringer kræver, at der gives eksklusiv forsikringsmæglerfuldmagt til Nordan Risk Partners.");
  drawText(ctx, "Fuldmagtsgiver er gjort opmærksomme på, at oplysninger, som forsikringsmægleren videregiver til forsikringsdistributører, i relation til de omhandlede forsikringer, sidestilles med oplysninger afgivet af Fuldmagtsgiver.");
  drawText(ctx, "Fuldmagtsgiver er gjort opmærksomme på, at undersøgelsesfuldmagten til enhver tid kan tilbagekaldes af Fuldmagtsgiver på samme måde, som den er indgået og at den forbliver i kraft, indtil den skriftligt tilbagekaldes, eller der indgås mæglerfuldmagt med Nordan Risk Partners. Fuldmagten ophører dog automatisk 1 år efter underskriftsdatoen, såfremt den ikke er tilbagekaldt forinden.");
  drawText(ctx, "Fuldmagtsgiver påpeger, at Fuldmagtsgiver ønsker at Fuldmagtsgivers nuværende forsikringsmægler ikke involveres eller orienteres om nærværende undersøgelsesfuldmagt.");
  drawText(ctx, "Underskriver indestår for at være berettiget til at underskrive denne undersøgelsesfuldmagt og dermed berettiget til at forpligte Fuldmagtsgiver.");

  // The new big signature card
  drawSignatureCard(ctx, signer, audit);

  // Audit / certificate page
  newPage(ctx);
  drawText(ctx, "Signeringscertifikat", {
    size: 18,
    bold: true,
    color: VERIFIED_BLUE,
    gap: 4,
  });
  drawText(ctx, "Elektronisk signatur · eIDAS-forordningen art. 25", {
    size: 11,
    color: MUTED,
    gap: 18,
  });

  // Big verified-seal stamp
  ctx.page.drawCircle({
    x: PAGE_WIDTH - MARGIN_X - 50,
    y: ctx.y + 30,
    size: 36,
    borderColor: VERIFIED_BLUE,
    borderWidth: 2,
  });
  ctx.page.drawCircle({
    x: PAGE_WIDTH - MARGIN_X - 50,
    y: ctx.y + 30,
    size: 30,
    borderColor: VERIFIED_BLUE,
    borderWidth: 0.6,
  });
  ctx.page.drawText("VERIFICERET", {
    x: PAGE_WIDTH - MARGIN_X - 50 - 26,
    y: ctx.y + 36,
    size: 8,
    font: ctx.fontBold,
    color: VERIFIED_BLUE,
  });
  ctx.page.drawText("eIDAS art. 25", {
    x: PAGE_WIDTH - MARGIN_X - 50 - 26,
    y: ctx.y + 24,
    size: 7,
    font: ctx.font,
    color: VERIFIED_BLUE,
  });

  drawText(ctx, "Dokument", { bold: true, size: 11, color: VERIFIED_BLUE, gap: 6 });
  drawKv(ctx, "Titel", "Undersøgelsesfuldmagt — Nordan Risk Partners", { labelWidth: 110 });
  drawKv(ctx, "Original-hash", `sha256:${audit.documentHash.slice(0, 32)}…`, { labelWidth: 110 });

  ctx.y -= 8;
  drawText(ctx, "Underskriver", { bold: true, size: 11, color: VERIFIED_BLUE, gap: 6 });
  drawKv(ctx, "Navn", signer.name, { labelWidth: 110 });
  drawKv(ctx, "Titel", signer.title, { labelWidth: 110 });
  drawKv(ctx, "Firma", signer.companyName, { labelWidth: 110 });
  drawKv(ctx, "CVR", signer.cvr, { labelWidth: 110 });
  drawKv(ctx, "E-mail", signer.email, { labelWidth: 110 });
  if (signer.phone) drawKv(ctx, "Telefon", signer.phone, { labelWidth: 110 });

  ctx.y -= 8;
  drawText(ctx, "Signering", { bold: true, size: 11, color: VERIFIED_BLUE, gap: 6 });
  drawKv(
    ctx,
    "Tidspunkt",
    new Date(audit.signedAt).toLocaleString("da-DK", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: "Europe/Copenhagen",
    }),
    { labelWidth: 110 }
  );
  drawKv(ctx, "IP-adresse", audit.ip, { labelWidth: 110 });
  drawKv(ctx, "Browser", audit.userAgent.slice(0, 80), { labelWidth: 110 });
  drawKv(ctx, "Audit-ID", audit.auditId, { labelWidth: 110 });

  ctx.y -= 12;
  drawText(ctx, "Erklæring", { bold: true, size: 11, color: VERIFIED_BLUE, gap: 6 });
  drawText(
    ctx,
    "Underskriver bekræfter at have læst og forstået dokumentet, at være bemyndiget til at underskrive på vegne af ovennævnte virksomhed, og samtykker til elektronisk signering iht. eIDAS-forordningen (910/2014) artikel 25.",
    { size: 10, color: INK }
  );

  ctx.y -= 8;
  drawText(
    ctx,
    "Underskrivers samtykke er bekræftet ved eksplicit afkrydsning på signeringssiden, kombineret med ovenstående identifikations- og audit-data. Dokument-hash beregnet før og efter underskrift gør senere ændringer detekterbare af modtagende forsikringsselskaber.",
    { size: 9, color: MUTED }
  );

  ctx.y -= 14;
  drawText(ctx, "Verifikation", { bold: true, size: 11, color: VERIFIED_BLUE, gap: 6 });
  drawText(
    ctx,
    "Modtagende forsikringsselskab kan verificere autenticiteten ved at kontakte Nordan Risk Partners ApS på info@ndrp.dk eller +45 53 52 00 06 med henvisning til ovenstående Audit-ID.",
    { size: 9.5, color: INK }
  );

  // Footer
  const total = ctx.pageList.length;
  ctx.pageList.forEach((p, i) => drawFooter(p, font, i + 1, total));

  return await pdfDoc.save({ useObjectStreams: true });
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
    documentHash: await sha256Hex(new TextEncoder().encode("Undersøgelsesfuldmagt-NordanRiskPartners-v1-2026-05-template-seed")),
  };
  const bytes = await buildPdf(signer, audit);
  const out = path.join(__dirname, "sample-fuldmagt-v2.pdf");
  await fs.writeFile(out, bytes);
  console.log(`Wrote ${out} (${bytes.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
