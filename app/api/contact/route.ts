import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.MAIL_SMTP_HOST ?? "smtp.migadu.com";
const SMTP_PORT = Number(process.env.MAIL_SMTP_PORT ?? 465);
const SMTP_USER = process.env.MAIL_SMTP_USER ?? "info@ndrp.dk";
const SMTP_PASS = process.env.MAIL_SMTP_PASS;
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@ndrp.dk";

type Body = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  topic?: string;
  message: string;
};

function isValid(body: unknown): body is Body {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 1 &&
    typeof b.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) &&
    typeof b.message === "string" &&
    b.message.trim().length > 5
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  if (!SMTP_PASS) {
    console.error("MAIL_SMTP_PASS is not set");
    return NextResponse.json(
      { error: "Serveren er ikke konfigureret endnu. Prøv igen senere." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig anmodning." }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json(
      { error: "Udfyld venligst navn, en gyldig e-mail og en besked." },
      { status: 400 }
    );
  }

  const { name, email, phone, company, topic, message } = body;

  const rows = [
    ["Navn", name],
    ["E-mail", `<a href="mailto:${escapeHtml(email)}" style="color:#a58878;">${escapeHtml(email)}</a>`, true],
    phone ? ["Telefon", phone] : null,
    company ? ["Virksomhed", company] : null,
    topic ? ["Emne", topic] : null,
  ].filter(Boolean) as Array<[string, string, boolean?] | [string, string]>;

  const html = `
    <div style="font-family:Montserrat,-apple-system,system-ui,sans-serif;max-width:640px;margin:0 auto;color:#0a0a0a;">
      <h2 style="font-weight:500;color:#253f32;">Ny henvendelse fra nordanriskpartners.dk</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${rows
          .map(
            (r) =>
              `<tr><td style="padding:8px 0;color:#6b6b6b;width:140px;">${escapeHtml(r[0])}</td><td style="padding:8px 0;">${(r as [string, string, boolean?])[2] ? r[1] : escapeHtml(r[1])}</td></tr>`
          )
          .join("")}
      </table>
      <hr style="border:none;border-top:1px solid #e6e3df;margin:24px 0;" />
      <div style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</div>
    </div>
  `.trim();

  const text =
    `Ny henvendelse fra nordanriskpartners.dk\n\n` +
    `Navn: ${name}\nE-mail: ${email}${phone ? `\nTelefon: ${phone}` : ""}${company ? `\nVirksomhed: ${company}` : ""}${topic ? `\nEmne: ${topic}` : ""}\n\n${message}`;

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Nordan Risk Partners · nordanriskpartners.dk" <${SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject: `Ny henvendelse fra ${name}${company ? ` (${company})` : ""}`,
      html,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact SMTP error", err);
    return NextResponse.json(
      { error: "Kunne ikke sende beskeden. Prøv igen eller ring." },
      { status: 502 }
    );
  }
}
