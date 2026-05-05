import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  renderBrandedEmail,
  emailKvTable,
  emailPreBlock,
  escapeHtml,
  EMAIL_COLORS,
} from "@/lib/email-template";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";
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

  const kvRows: Array<[string, string] | [string, string, "html"]> = [
    ["Navn", name],
    ["E-mail", `<a href="mailto:${escapeHtml(email)}" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">${escapeHtml(email)}</a>`, "html"],
  ];
  if (phone) kvRows.push(["Telefon", phone]);
  if (company) kvRows.push(["Virksomhed", company]);
  if (topic) kvRows.push(["Emne", topic]);

  const filesHtml = urlFiles.length
    ? `<div style="margin-top:24px;">
         <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:10px;">Uploadede filer (${urlFiles.length})</div>
         <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">
           ${urlFiles
             .map(
               (f) => `<tr>
                 <td style="padding:10px 0;border-bottom:1px solid ${EMAIL_COLORS.line};font-family:Arial,Helvetica,sans-serif;font-size:14px;">
                   <a href="${escapeHtml(f.url)}" style="color:${EMAIL_COLORS.accent};font-weight:600;text-decoration:none;">${escapeHtml(f.name)}</a>
                   <span style="color:#6b6b6b;font-size:12px;margin-left:8px;">${f.kind === "authorization" ? "fuldmagt" : "police"}${f.size ? ` · ${Math.round(f.size / 1024)} KB` : ""}</span>
                 </td>
               </tr>`
             )
             .join("")}
         </table>
       </div>`
    : "";

  const bodyHtml = `
    ${emailKvTable(kvRows)}
    <div style="margin-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Besked</div>
    ${emailPreBlock(message)}
    ${filesHtml}
  `;

  const html = renderBrandedEmail({
    preheader: `Ny henvendelse fra ${name}${company ? ` (${company})` : ""}`,
    eyebrow: topic ?? "Ny henvendelse",
    title: `${name}${company ? ` · ${company}` : ""}`,
    bodyHtml,
  });

  const filesText = urlFiles.length
    ? `\n\nUploadede filer:\n${urlFiles.map((f) => `- ${f.name}${f.kind === "authorization" ? " (fuldmagt)" : ""}: ${f.url}`).join("\n")}`
    : "";

  const text =
    `Ny henvendelse fra nordanriskpartners.dk\n\n` +
    `Navn: ${name}\nE-mail: ${email}${phone ? `\nTelefon: ${phone}` : ""}${company ? `\nVirksomhed: ${company}` : ""}${topic ? `\nEmne: ${topic}` : ""}\n\n${message}${filesText}`;

  const subject = `Ny henvendelse fra ${name}${company ? ` (${company})` : ""}${totalFileCount ? ` · ${totalFileCount} fil${totalFileCount === 1 ? "" : "er"}` : ""}`;

  // Graceful no-op if Resend not yet configured.
  if (!RESEND_API_KEY) {
    console.warn("[contact] RESEND_API_KEY missing — submission logged but not emailed", {
      to: TO_EMAIL,
      subject,
      from: email,
      name,
      phone,
      company,
      files: urlFiles,
      attachmentCount: attachments.length,
    });
    return NextResponse.json({ ok: true, queued: true, mailConfigured: false });
  }

  // Confirmation copy sent to the submitter so they have a paper trail of what they sent.
  const confirmationHtml = renderBrandedEmail({
    preheader: `Vi har modtaget jeres henvendelse — vi vender tilbage inden for én hverdag.`,
    eyebrow: "Bekræftelse",
    title: "Tak — vi har modtaget jeres henvendelse",
    bodyHtml: `
      <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">
        Hej ${escapeHtml(name.split(" ")[0] || name)},
      </p>
      <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">
        Tak for din henvendelse. Vi vender tilbage til ${escapeHtml(email)} inden for én hverdag — typisk hurtigere.
      </p>
      <p style="margin:0 0 18px;font-size:15.5px;line-height:1.65;">
        Nedenfor kan du se hvad vi har modtaget. Skriv eller ring hvis noget er forkert eller skal ændres.
      </p>
      <div style="margin-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Dine oplysninger</div>
      ${emailKvTable(kvRows)}
      <div style="margin-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Din besked</div>
      ${emailPreBlock(message)}
      ${filesHtml}
      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6b6b6b;">
        Spørgsmål? Ring <a href="tel:+4553520006" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">+45 53 52 00 06</a> eller svar direkte på denne mail.
      </p>
    `,
  });
  const confirmationText =
    `Hej ${name.split(" ")[0] || name},\n\n` +
    `Tak for din henvendelse. Vi vender tilbage inden for én hverdag.\n\n` +
    `Vi har modtaget følgende:\n\n${text}\n\n` +
    `Skriv eller ring hvis noget skal ændres.\n` +
    `+45 53 52 00 06 · info@ndrp.dk`;

  try {
    const resend = new Resend(RESEND_API_KEY);

    // Internal — to Nordan
    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject,
      html,
      text,
      attachments: attachments.length
        ? attachments.map((a) => ({ filename: a.filename, content: a.content }))
        : undefined,
    });
    if (sendError) throw sendError;

    // Confirmation — to submitter (best-effort, don't fail the request if this errors)
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        replyTo: TO_EMAIL,
        subject: `Bekræftelse · ${topic ?? "Vi har modtaget din henvendelse"}`,
        html: confirmationHtml,
        text: confirmationText,
      });
    } catch (confirmErr) {
      console.warn("[contact] Confirmation to submitter failed (non-fatal):", confirmErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend send failed:", err);
    return NextResponse.json({
      ok: true,
      queued: true,
      mailConfigured: true,
      mailFailed: true,
    });
  }
}
