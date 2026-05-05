/**
 * One-shot endpoint: send the current homepage testimonials to Mads
 * (mh@ndrp.dk) so he can confirm/correct them. Hit it once with
 * ?secret=<CRON_SECRET> from a browser. After Mads has replied, this
 * file can be deleted.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { TESTIMONIALS } from "@/app/_components/TestimonialMarquee";
import {
  renderBrandedEmail,
  EMAIL_COLORS,
  escapeHtml,
} from "@/lib/email-template";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 }
    );
  }

  const cards = TESTIMONIALS.map(
    (t, i) => `
    <div style="margin-top:18px;padding:18px 20px;border:1px solid ${EMAIL_COLORS.line};border-radius:6px;background:#ffffff;">
      <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Citat ${i + 1}</div>
      <div style="font-size:15px;line-height:1.65;color:#0a0a0a;font-style:italic;">«${escapeHtml(t.quote)}»</div>
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid ${EMAIL_COLORS.line};font-size:13px;color:#0a0a0a;">
        <strong>${escapeHtml(t.name)}</strong>${t.title ? `, ${escapeHtml(t.title)}` : ""}<br/>
        <span style="color:#6b6b6b;">${escapeHtml(t.company)}</span>
      </div>
    </div>`
  ).join("");

  const html = renderBrandedEmail({
    preheader: "Bekræft eller ret følgende kundecitater før vi viser dem på forsiden",
    eyebrow: "Bekræft kundeanmeldelser",
    title: "Vil du tjekke disse citater?",
    bodyHtml: `
      <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">Hej Mads,</p>
      <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">
        Vi har skjult kundeanmeldelses-sektionen på forsiden indtil du har bekræftet de fire citater nedenfor. Skriv blot tilbage på denne mail med:
      </p>
      <ul style="margin:0 0 16px 18px;padding:0;font-size:15px;line-height:1.7;color:#0a0a0a;">
        <li>OK hvis citatet kan blive som det er</li>
        <li>Rettelser hvis ordlyd, navn, titel eller firma skal ændres</li>
        <li>Slet hvis citatet ikke skal med</li>
      </ul>
      <p style="margin:0 0 16px;font-size:15.5px;line-height:1.65;">
        Når du har sendt mig dine kommentarer, opdaterer jeg sitet og fjerner skjuleren — så ryger sektionen live igen med jeres godkendte citater.
      </p>
      ${cards}
      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b6b6b;">
        Tak. — Sebastian
      </p>
    `,
  });

  const text = `Hej Mads,

Vi har skjult kundeanmeldelses-sektionen på forsiden indtil du har bekræftet de fire citater nedenfor.

${TESTIMONIALS.map(
    (t, i) =>
      `--- Citat ${i + 1} ---\n«${t.quote}»\n— ${t.name}${t.title ? ", " + t.title : ""}, ${t.company}\n`
  ).join("\n")}

Skriv tilbage med: OK / Rettelser / Slet for hvert.

Tak. — Sebastian`;

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: "mh@ndrp.dk",
    replyTo: "sebastian@invisu.dk",
    subject: "Bekræft kundeanmeldelser til forsiden — Nordan Risk Partners",
    html,
    text,
  });
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });
  return NextResponse.json({ ok: true, sentTo: "mh@ndrp.dk", count: TESTIMONIALS.length });
}
