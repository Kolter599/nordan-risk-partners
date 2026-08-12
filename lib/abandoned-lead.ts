/**
 * Frafaldne CVR-flows → rigtige leads.
 *
 * Når nogen indtaster CVR og/eller kontaktoplysninger men aldrig underskriver
 * fuldmagten, er der stadig et lead: enten har vi personens navn/mail/telefon,
 * eller også har vi CVR — og så kan virksomheden slås op og ringes til.
 *
 * Dette modul holder al formatering + CVR-opslag ét sted, så cron-routen kun
 * står for at hente sessioner, oprette leads og sende mails.
 */

import type { Session, FunnelStep } from "./db";
import { escapeHtml } from "./email-template";

/** RFC 2606-reserveret TLD — kan aldrig ramme en rigtig postkasse. */
const UNKNOWN_EMAIL_DOMAIN = "ukendt.invalid";

/**
 * leads.email er NOT NULL og bruges som dedup-nøgle. Har vi kun CVR, laver vi
 * en deterministisk pladsholder pr. virksomhed — så to frafald fra samme CVR
 * opdaterer det samme lead i stedet for at stable rækker op.
 */
export function placeholderEmailForCvr(cvr: string): string {
  return `cvr-${cvr.replace(/\D/g, "")}@${UNKNOWN_EMAIL_DOMAIN}`;
}

/** True hvis mailen er vores egen pladsholder og ikke må vises eller mailes til. */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(`@${UNKNOWN_EMAIL_DOMAIN}`);
}

/**
 * Den mail leadet skal gemmes under. Rigtig mail hvis vi har den, ellers en
 * CVR-pladsholder. null betyder "ikke nok til et lead" — hverken mail eller CVR.
 */
export function leadEmailForSession(s: Session): string | null {
  const real = s.contact_email?.trim();
  if (real) return real.toLowerCase();
  if (s.cvr) return placeholderEmailForCvr(s.cvr);
  return null;
}

export const STEP_LABELS: Record<FunnelStep, string> = {
  started: "Startede flowet",
  cvr_submitted: "CVR indtastet",
  confirm: "Bekræftede firma",
  actions: "Nået til underskrift",
  completed: "Gennemført",
};

/* -------------------- CVR-opslag -------------------- */

export type CvrEnrichment = {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  industry: string | null;
  employees: string | null;
};

/**
 * Slår virksomheden op, så mailen kan indeholde adresse og offentligt
 * telefonnummer. Vigtigst for de frafald hvor vi kun har CVR — der er
 * opslaget den eneste vej til at kunne kontakte dem.
 *
 * Går gennem vores egen /api/cvr frem for direkte til cvrapi.dk: den route
 * kører på edge i Frankfurt, og cvrapi.dk afviser Vercels amerikanske IP'er.
 *
 * Best-effort: alle fejl giver null, og mailen sendes uanset hvad.
 */
export async function lookupCvr(cvr: string | null): Promise<CvrEnrichment | null> {
  const digits = cvr?.replace(/\D/g, "") ?? "";
  if (digits.length !== 8) return null;
  const origin = process.env.SITE_ORIGIN ?? "https://nordanriskpartners.dk";
  try {
    const res = await fetch(`${origin}/api/cvr?cvr=${digits}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ok?: boolean;
      company?: Record<string, unknown>;
    };
    if (!data.ok || !data.company) return null;
    const c = data.company;
    const str = (v: unknown): string | null => {
      if (typeof v === "number") return String(v);
      if (typeof v !== "string") return null;
      const t = v.trim();
      return t.length ? t : null;
    };
    return {
      name: str(c.name),
      address: str(c.address),
      phone: str(c.phone),
      email: str(c.email),
      industry: str(c.industry),
      employees: str(c.employees),
    };
  } catch (err) {
    console.warn("[abandoned-lead] CVR-opslag fejlede for", digits, err);
    return null;
  }
}

/* -------------------- Attribution -------------------- */

/** Referrer-host → kanal. Spejler lib/db.ts, så labels matcher /admin. */
function deriveFromReferrer(referrer: string | null): { source: string; medium: string } {
  if (!referrer) return { source: "direct", medium: "direct" };
  const h = referrer.toLowerCase();
  if (h.includes("linkedin.")) return { source: "linkedin", medium: "social" };
  if (h.includes("facebook.")) return { source: "facebook", medium: "social" };
  if (h.includes("instagram.")) return { source: "instagram", medium: "social" };
  if (h === "x.com" || h === "twitter.com" || h === "t.co") return { source: "twitter", medium: "social" };
  if (h.includes("youtube.")) return { source: "youtube", medium: "social" };
  if (h.includes("google.")) return { source: "google", medium: "organic" };
  if (h.includes("bing.")) return { source: "bing", medium: "organic" };
  if (h.includes("mail.")) return { source: "email", medium: "email" };
  if (h.includes("chatgpt.")) return { source: "chatgpt", medium: "ai" };
  return { source: h, medium: "referral" };
}

export function sourceFor(s: Session): { source: string; medium: string } {
  const derived = deriveFromReferrer(s.first_touch_referrer);
  return {
    source: s.first_touch_source ?? derived.source,
    medium: s.first_touch_medium ?? derived.medium,
  };
}

function whenLabel(iso: string): string {
  return new Date(iso).toLocaleString("da-DK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });
}

/* -------------------- Mail -------------------- */

const ADMIN_URL = "https://nordanriskpartners.dk/admin-invisu";

export type AbandonedLeadEmail = {
  subject: string;
  html: string;
  text: string;
  /** Sæt kun reply-to når vi har en rigtig mailadresse at svare til. */
  replyTo: string | null;
};

/**
 * Intern lead-mail for et frafaldent flow. Samme rolige, forward-venlige stil
 * som de almindelige lead-mails fra /api/contact — så den lander i info@ndrp.dk
 * og kan behandles som et lead, ikke som en rapport.
 */
export function renderAbandonedLeadEmail(
  s: Session,
  cvrInfo: CvrEnrichment | null
): AbandonedLeadEmail {
  const company = s.company ?? cvrInfo?.name ?? "Ukendt virksomhed";
  const { source, medium } = sourceFor(s);
  const step = STEP_LABELS[s.furthest_step] ?? s.furthest_step;
  const landing = s.first_touch_path ?? s.landing_path ?? s.source_path;
  const email = s.contact_email?.trim() || null;
  const phone = s.contact_phone?.trim() || null;
  const name = s.contact_name?.trim() || null;
  const hasContact = !!(email || phone);

  const subject = `Uafsluttet forespørgsel — ${company}${s.cvr ? ` (CVR ${s.cvr})` : ""}`;

  const contactHtml = hasContact
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
         ${name ? `<tr><td style="padding:3px 16px 3px 0;color:#6b6b6b;">Navn</td><td style="padding:3px 0;font-weight:600;">${escapeHtml(name)}</td></tr>` : ""}
         ${email ? `<tr><td style="padding:3px 16px 3px 0;color:#6b6b6b;">E-mail</td><td style="padding:3px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#a58878;font-weight:600;text-decoration:none;">${escapeHtml(email)}</a></td></tr>` : ""}
         ${phone ? `<tr><td style="padding:3px 16px 3px 0;color:#6b6b6b;">Telefon</td><td style="padding:3px 0;"><a href="tel:${escapeHtml(phone.replace(/\s/g, ""))}" style="color:#a58878;font-weight:600;text-decoration:none;">${escapeHtml(phone)}</a></td></tr>` : ""}
       </table>`
    : `<div style="color:#6b6b6b;">Ingen kontaktoplysninger indtastet — men vi har CVR, så virksomheden kan kontaktes direkte.</div>`;

  const cvrRows: Array<[string, string]> = [];
  if (cvrInfo?.address) cvrRows.push(["Adresse", cvrInfo.address]);
  if (cvrInfo?.phone) cvrRows.push(["Telefon (CVR)", cvrInfo.phone]);
  if (cvrInfo?.email) cvrRows.push(["E-mail (CVR)", cvrInfo.email]);
  if (cvrInfo?.industry) cvrRows.push(["Branche", cvrInfo.industry]);
  if (cvrInfo?.employees) cvrRows.push(["Ansatte", cvrInfo.employees]);

  const cvrHtml = cvrRows.length
    ? `<div style="margin-top:20px;">
         <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#a58878;margin-bottom:8px;">Fra CVR-registret</div>
         <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
           ${cvrRows
             .map(
               ([k, v]) =>
                 `<tr><td style="padding:3px 16px 3px 0;color:#6b6b6b;">${escapeHtml(k)}</td><td style="padding:3px 0;">${
                   k.startsWith("Telefon")
                     ? `<a href="tel:${escapeHtml(v.replace(/\s/g, ""))}" style="color:#a58878;font-weight:600;text-decoration:none;">${escapeHtml(v)}</a>`
                     : escapeHtml(v)
                 }</td></tr>`
             )
             .join("")}
         </table>
       </div>`
    : "";

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;font-size:14px;line-height:1.55;">
<div style="max-width:640px;">
  <div style="font-size:13px;color:#6b6b6b;margin-bottom:6px;">Uafsluttet forespørgsel fra nordanriskpartners.dk</div>
  <h2 style="margin:0 0 6px 0;font-size:18px;font-weight:600;color:#253f32;">${escapeHtml(company)}${s.cvr ? ` <span style="color:#6b6b6b;font-weight:500;">· CVR ${escapeHtml(s.cvr)}</span>` : ""}</h2>
  <div style="margin-bottom:18px;">
    <span style="display:inline-block;padding:2px 9px;border-radius:10px;background:#a1620715;color:#a16207;font-weight:600;font-size:11px;">${escapeHtml(step)}</span>
    <span style="font-size:12px;color:#6b6b6b;margin-left:6px;">sidst aktiv ${escapeHtml(whenLabel(s.last_seen_at))}</span>
  </div>

  <div style="padding:14px 16px;background:#faf7f2;border-left:3px solid #a58878;border-radius:4px;">
    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#a58878;margin-bottom:8px;">Kontakt</div>
    ${contactHtml}
  </div>

  ${cvrHtml}

  <div style="margin-top:20px;font-size:13px;color:#6b6b6b;line-height:1.7;">
    Kom fra <strong style="color:#0a0a0a;">${escapeHtml(source)}</strong> · ${escapeHtml(medium)}
    ${landing ? `<br/>Landede på <span style="color:#0a0a0a;">${escapeHtml(landing)}</span>` : ""}
  </div>

  <hr style="border:none;border-top:1px solid #e6e3df;margin:24px 0 12px;" />
  <div style="font-size:12px;color:#6b6b6b;line-height:1.7;">
    <strong style="color:#0a0a0a;">Fuldmagten er ikke underskrevet.</strong> Vi må derfor ikke indhente policer
    hos selskaberne endnu — det her er en opfølgning, ikke en sag.
    <br/>Se det fulde overblik på <a href="${ADMIN_URL}" style="color:#a58878;text-decoration:none;font-weight:600;">admin-dashboardet</a>. Du får kun denne mail én gang pr. virksomhed.
  </div>
</div>
</body></html>`;

  const text =
    `Uafsluttet forespørgsel fra nordanriskpartners.dk\n\n` +
    `${company}${s.cvr ? ` (CVR ${s.cvr})` : ""}\n` +
    `${step} · sidst aktiv ${whenLabel(s.last_seen_at)}\n\n` +
    `Kontakt:\n` +
    (hasContact
      ? `${name ? `Navn: ${name}\n` : ""}${email ? `E-mail: ${email}\n` : ""}${phone ? `Telefon: ${phone}\n` : ""}`
      : `Ingen kontaktoplysninger indtastet — men vi har CVR, så virksomheden kan kontaktes direkte.\n`) +
    (cvrRows.length
      ? `\nFra CVR-registret:\n${cvrRows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n`
      : "") +
    `\nKom fra ${source} · ${medium}${landing ? `\nLandede på ${landing}` : ""}\n\n` +
    `Fuldmagten er ikke underskrevet — vi må ikke indhente policer endnu.\n` +
    `Overblik: ${ADMIN_URL}`;

  return { subject, html, text, replyTo: email };
}
