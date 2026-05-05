/**
 * Shared email shell — wraps any HTML body in a Nordan-branded layout.
 * Email clients (Outlook in particular) ignore most CSS; everything inline,
 * tables for structure, web-safe fonts only.
 */

const SITE_URL = "https://nordanriskpartners.dk";
const LOGO_URL = `${SITE_URL}/images/logo-fuldmagt.png`;
const NORDAN_GREEN = "#253f32";
const NORDAN_ACCENT = "#a58878";
const NORDAN_SOFT = "#ede8e2";
const NORDAN_LINE = "#e6e3df";
const INK = "#0f1411";
const INK_SOFT = "#404640";

const FONT_BODY = "Georgia, 'Times New Roman', serif";
const FONT_HEAD = "Georgia, 'Times New Roman', serif";
const FONT_MONO = "Menlo, Consolas, monospace";

type RenderArgs = {
  /** Preheader text (shows up in inbox preview but not in the body). */
  preheader?: string;
  /** Optional eyebrow above title — uppercase tracked. */
  eyebrow?: string;
  /** Big title at top of message. */
  title?: string;
  /** Inline HTML body (already escaped). */
  bodyHtml: string;
};

export function renderBrandedEmail({ preheader, eyebrow, title, bodyHtml }: RenderArgs): string {
  return `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Nordan Risk Partners</title>
</head>
<body style="margin:0;padding:0;background:${NORDAN_SOFT};font-family:${FONT_BODY};color:${INK};">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${NORDAN_SOFT};opacity:0;">${escapeHtml(preheader)}</div>` : ""}

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${NORDAN_SOFT};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">

        <!-- HEADER -->
        <tr>
          <td style="background:${NORDAN_GREEN};padding:28px 32px 26px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <img src="${LOGO_URL}" alt="Nordan Risk Partners" width="180" height="auto" style="display:block;height:auto;max-height:36px;width:auto;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${eyebrow || title ? `
        <!-- TITLE BLOCK -->
        <tr>
          <td style="padding:32px 32px 4px;">
            ${eyebrow ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${NORDAN_ACCENT};margin-bottom:10px;">${escapeHtml(eyebrow)}</div>` : ""}
            ${title ? `<h1 style="margin:0;font-family:${FONT_HEAD};font-weight:500;font-size:26px;line-height:1.18;letter-spacing:-0.005em;color:${NORDAN_GREEN};">${escapeHtml(title)}</h1>` : ""}
          </td>
        </tr>
        ` : ""}

        <!-- BODY -->
        <tr>
          <td style="padding:24px 32px 32px;font-family:${FONT_BODY};font-size:15.5px;line-height:1.65;color:${INK_SOFT};">
            ${bodyHtml}
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="padding:0 32px;">
            <div style="border-top:1px solid ${NORDAN_LINE};"></div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:22px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b6b6b;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top;">
                  <strong style="color:${NORDAN_GREEN};font-family:${FONT_HEAD};font-size:13px;">Nordan Risk Partners ApS</strong><br />
                  Toftevej 15B · 3450 Allerød<br />
                  CVR 4595 3769
                </td>
                <td style="vertical-align:top;text-align:right;">
                  <a href="tel:+4553520006" style="color:${NORDAN_ACCENT};text-decoration:none;font-weight:600;">+45 53 52 00 06</a><br />
                  <a href="mailto:info@ndrp.dk" style="color:${NORDAN_ACCENT};text-decoration:none;font-weight:600;">info@ndrp.dk</a><br />
                  <a href="${SITE_URL}" style="color:${NORDAN_ACCENT};text-decoration:none;font-weight:600;">nordanriskpartners.dk</a>
                </td>
              </tr>
            </table>
            <div style="margin-top:16px;font-style:italic;color:#9a9a9a;">
              Uafhængig forsikringsmægler · Godkendt af Finanstilsynet · Medlem af FMF
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/* ---------------- Helpers used inside body templates ---------------- */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Two-column key/value table (label left, value right). */
export function emailKvTable(rows: Array<[string, string] | [string, string, "html"]>): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;margin:8px 0;">
${rows
  .map(
    (r) => `<tr>
  <td style="padding:8px 0;width:140px;color:${INK_SOFT};font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;vertical-align:top;">${escapeHtml(r[0])}</td>
  <td style="padding:8px 0;color:${INK};font-family:${FONT_BODY};font-size:15px;vertical-align:top;">${r[2] === "html" ? r[1] : escapeHtml(r[1])}</td>
</tr>`
  )
  .join("\n")}
</table>`;
}

/** Bordered card around content — used for highlighted info or audit logs. */
export function emailCard(content: string, opts: { tone?: "soft" | "accent" } = {}): string {
  const bg = opts.tone === "accent" ? "#faf7f2" : NORDAN_SOFT;
  const border = opts.tone === "accent" ? NORDAN_ACCENT : NORDAN_LINE;
  return `<div style="background:${bg};border:1px solid ${border};border-radius:6px;padding:18px 20px;margin:16px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${INK};">${content}</div>`;
}

/** CTA button styled to brand. */
export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;"><tr><td style="background:${NORDAN_ACCENT};border-radius:4px;"><a href="${href}" style="display:inline-block;padding:13px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">${escapeHtml(label)}</a></td></tr></table>`;
}

/** Pre-formatted block (good for free-text message bodies). */
export function emailPreBlock(text: string): string {
  return `<div style="white-space:pre-wrap;font-family:${FONT_MONO};font-size:13px;line-height:1.55;color:${INK};background:#fafaf8;border:1px solid ${NORDAN_LINE};border-radius:4px;padding:14px 16px;margin:8px 0;">${escapeHtml(text)}</div>`;
}

export const EMAIL_COLORS = {
  green: NORDAN_GREEN,
  accent: NORDAN_ACCENT,
  soft: NORDAN_SOFT,
  line: NORDAN_LINE,
  ink: INK,
  inkSoft: INK_SOFT,
};
