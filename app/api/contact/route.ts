import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  renderBrandedEmail,
  emailKvTable,
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
  /** Customer-facing summary shown in the confirmation copy. Optional;
   *  if omitted, the confirmation email skips the "what you submitted"
   *  block and just confirms receipt + contact info. The internal `topic`
   *  and `message` fields are NEVER shown to the customer. */
  customerMessage?: string;
  /** Whether to send a confirmation copy to the submitter. Defaults to true. */
  sendCustomerConfirmation?: boolean;
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
        customerMessage: String(form.get("customerMessage") ?? "") || undefined,
        sendCustomerConfirmation: form.get("sendCustomerConfirmation") !== "false",
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

  const { name, email, phone, company, topic, message, customerMessage, sendCustomerConfirmation = true } = body;
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

  // Internal mail to Mads — plain & forward-friendly. No logo wrap, no footer.
  // Structured so the whole client block is easy to copy/paste or forward as-is.
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;font-size:14px;line-height:1.55;">
<div style="max-width:640px;">
  <div style="font-size:13px;color:#6b6b6b;margin-bottom:6px;">Henvendelse fra nordanriskpartners.dk${topic ? ` · ${escapeHtml(topic)}` : ""}</div>
  <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#253f32;">${escapeHtml(name)}${company ? ` <span style="color:#6b6b6b;font-weight:500;">· ${escapeHtml(company)}</span>` : ""}</h2>

  ${emailKvTable(kvRows)}

  <div style="margin-top:20px;font-size:14px;line-height:1.65;color:#0a0a0a;">${escapeHtml(message).replace(/\n/g, "<br/>")}</div>
  ${filesHtml}

  <hr style="border:none;border-top:1px solid #e6e3df;margin:24px 0 12px;" />
  <div style="font-size:12px;color:#6b6b6b;">
    Svar går direkte til kunden (reply-to: <a href="mailto:${escapeHtml(email)}" style="color:#a58878;">${escapeHtml(email)}</a>).
  </div>
</div>
</body></html>`;

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

  // Customer-facing confirmation. Strips internal taxonomy (topic, message,
  // auth-method jargon, "Policer uploaded: 2") — uses the form-supplied
  // customerMessage if present and never echoes the internal `topic`.
  const firstName = name.split(" ")[0] || name;
  const customerKvRows: Array<[string, string] | [string, string, "html"]> = [
    ["Navn", name],
    ["E-mail", email],
  ];
  if (phone) customerKvRows.push(["Telefon", phone]);
  if (company && company !== name) customerKvRows.push(["Virksomhed", company]);

  const customerFilesHtml = urlFiles.length || attachments.length
    ? (() => {
        const allNames = [
          ...urlFiles.map((f) => f.name),
          ...attachments.map((a) => a.filename),
        ];
        return `<div style="margin-top:18px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Vedhæftede dokumenter (${allNames.length})</div>
          <div style="font-size:14px;line-height:1.7;color:#0a0a0a;">${allNames.map((n) => `· ${escapeHtml(n)}`).join("<br/>")}</div>
        </div>`;
      })()
    : "";

  const summaryBlock = customerMessage
    ? `<div style="margin-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Hvad vi har modtaget</div>
       <div style="font-size:15px;line-height:1.7;color:#0a0a0a;">${escapeHtml(customerMessage).replace(/\n/g, "<br/>")}</div>`
    : "";

  const confirmationHtml = renderBrandedEmail({
    preheader: `Tak — vi har modtaget din henvendelse og vender tilbage inden for én hverdag.`,
    eyebrow: "Bekræftelse",
    title: "Tak — vi er på sagen",
    bodyHtml: `
      <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">Hej ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">
        Vi har modtaget din henvendelse og vender tilbage til <strong>${escapeHtml(email)}</strong> inden for én hverdag — ofte hurtigere.
      </p>
      <p style="margin:0 0 8px;font-size:15.5px;line-height:1.65;">
        Skriv eller ring hvis noget skal ændres, eller hvis du kommer i tanker om mere.
      </p>
      <div style="margin-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Dine kontaktoplysninger</div>
      ${emailKvTable(customerKvRows)}
      ${summaryBlock}
      ${customerFilesHtml}
      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#6b6b6b;">
        Spørgsmål? Ring <a href="tel:+4553520006" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">+45 53 52 00 06</a>
        eller svar direkte på denne mail.
      </p>
    `,
  });
  const confirmationText =
    `Hej ${firstName},\n\n` +
    `Vi har modtaget din henvendelse og vender tilbage til ${email} inden for én hverdag — ofte hurtigere.\n\n` +
    `Dine kontaktoplysninger:\n` +
    `Navn: ${name}\nE-mail: ${email}` +
    (phone ? `\nTelefon: ${phone}` : "") +
    (company && company !== name ? `\nVirksomhed: ${company}` : "") +
    (customerMessage ? `\n\nHvad vi har modtaget:\n${customerMessage}` : "") +
    (urlFiles.length || attachments.length
      ? `\n\nVedhæftede dokumenter:\n${[...urlFiles.map((f) => f.name), ...attachments.map((a) => a.filename)].map((n) => `- ${n}`).join("\n")}`
      : "") +
    `\n\nSpørgsmål? Ring +45 53 52 00 06 eller svar på denne mail.`;

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

    // Confirmation — to submitter (best-effort, don't fail the request if this errors).
    // Subject is intentionally generic — we never expose the internal `topic` taxonomy.
    if (sendCustomerConfirmation) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          replyTo: TO_EMAIL,
          subject: "Vi har modtaget din henvendelse — Nordan Risk Partners",
          html: confirmationHtml,
          text: confirmationText,
        });
      } catch (confirmErr) {
        console.warn("[contact] Confirmation to submitter failed (non-fatal):", confirmErr);
      }
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
