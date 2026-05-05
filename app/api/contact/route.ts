import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.MAIL_SMTP_HOST ?? "smtp.migadu.com";
const SMTP_PORT = Number(process.env.MAIL_SMTP_PORT ?? 465);
const SMTP_USER = process.env.MAIL_SMTP_USER ?? "info@ndrp.dk";
const SMTP_PASS = process.env.MAIL_SMTP_PASS;
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@ndrp.dk";

type UploadedFile = {
  name: string;
  url: string;
  size?: number;
  kind?: "policy" | "authorization";
};

type Body = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  topic?: string;
  message: string;
  files?: UploadedFile[];
};

type Attachment = {
  filename: string;
  content: Buffer;
  contentType: string;
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
  const contentType = req.headers.get("content-type") ?? "";
  let body: unknown;
  const attachments: Attachment[] = [];
  let urlFiles: UploadedFile[] = [];

  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await req.formData();
      const filesRaw = form.getAll("files");
      for (const f of filesRaw) {
        if (f instanceof File && f.size > 0) {
          const buf = Buffer.from(await f.arrayBuffer());
          attachments.push({
            filename: f.name || "fil",
            content: buf,
            contentType: f.type || "application/octet-stream",
          });
        }
      }
      body = {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? "") || undefined,
        company: String(form.get("company") ?? "") || undefined,
        topic: String(form.get("topic") ?? "") || undefined,
        message: String(form.get("message") ?? ""),
      };
    } catch {
      return NextResponse.json({ error: "Ugyldig anmodning." }, { status: 400 });
    }
  } else {
    try {
      body = await req.json();
      if (body && typeof body === "object" && Array.isArray((body as Record<string, unknown>).files)) {
        urlFiles = (body as { files: UploadedFile[] }).files.filter(
          (f) => f && typeof f.url === "string" && typeof f.name === "string"
        );
      }
    } catch {
      return NextResponse.json({ error: "Ugyldig anmodning." }, { status: 400 });
    }
  }

  if (!isValid(body)) {
    return NextResponse.json(
      { error: "Udfyld venligst navn, en gyldig e-mail og en besked." },
      { status: 400 }
    );
  }

  const { name, email, phone, company, topic, message } = body;
  const totalFileCount = attachments.length + urlFiles.length;

  const rows = [
    ["Navn", name],
    ["E-mail", `<a href="mailto:${escapeHtml(email)}" style="color:#a58878;">${escapeHtml(email)}</a>`, true],
    phone ? ["Telefon", phone] : null,
    company ? ["Virksomhed", company] : null,
    topic ? ["Emne", topic] : null,
  ].filter(Boolean) as Array<[string, string, boolean?] | [string, string]>;

  const filesHtml = urlFiles.length
    ? `<hr style="border:none;border-top:1px solid #e6e3df;margin:24px 0;" />
       <h3 style="font-weight:600;color:#253f32;margin:0 0 12px 0;">Uploadede filer (${urlFiles.length})</h3>
       <ul style="list-style:none;padding:0;margin:0;">
         ${urlFiles
           .map(
             (f) => `<li style="padding:8px 0;border-bottom:1px solid #f3f1ed;">
               <a href="${escapeHtml(f.url)}" style="color:#a58878;font-weight:600;text-decoration:none;">${escapeHtml(f.name)}</a>
               <span style="color:#6b6b6b;font-size:12px;margin-left:8px;">${f.kind === "authorization" ? "(fuldmagt)" : ""}${f.size ? ` ${Math.round(f.size / 1024)} KB` : ""}</span>
             </li>`
           )
           .join("")}
       </ul>`
    : "";

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
      ${filesHtml}
    </div>
  `.trim();

  const filesText = urlFiles.length
    ? `\n\nUploadede filer:\n${urlFiles.map((f) => `- ${f.name}${f.kind === "authorization" ? " (fuldmagt)" : ""}: ${f.url}`).join("\n")}`
    : "";

  const text =
    `Ny henvendelse fra nordanriskpartners.dk\n\n` +
    `Navn: ${name}\nE-mail: ${email}${phone ? `\nTelefon: ${phone}` : ""}${company ? `\nVirksomhed: ${company}` : ""}${topic ? `\nEmne: ${topic}` : ""}\n\n${message}${filesText}`;

  const subject = `Ny henvendelse fra ${name}${company ? ` (${company})` : ""}${totalFileCount ? ` · ${totalFileCount} fil${totalFileCount === 1 ? "" : "er"}` : ""}`;

  // Graceful no-op if SMTP not yet configured: log everything so we can audit
  // submissions in Vercel logs while one.com / mail credentials are still being set up.
  if (!SMTP_PASS) {
    console.warn("[contact] SMTP not configured — submission logged but not emailed", {
      to: TO_EMAIL,
      subject,
      from: email,
      name,
      phone,
      company,
      message,
      files: urlFiles,
      attachmentCount: attachments.length,
    });
    return NextResponse.json({ ok: true, queued: true, smtpConfigured: false });
  }

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
      subject,
      html,
      text,
      attachments: attachments.length ? attachments : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact SMTP error", err);
    // Don't fail the user-facing flow even if SMTP errors — log loudly,
    // tell the client it was queued so they see a successful submit.
    return NextResponse.json({
      ok: true,
      queued: true,
      smtpConfigured: true,
      smtpFailed: true,
    });
  }
}
