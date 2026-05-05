import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import {
  buildSignedFuldmagtPdf,
  computeOriginalHash,
  type SignerData,
} from "@/lib/fuldmagt-pdf";
import {
  renderBrandedEmail,
  emailKvTable,
  EMAIL_COLORS,
} from "@/lib/email-template";
import { upsertLead, recordEvent } from "@/lib/db";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@ndrp.dk";

type SignRequest = {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  cvr?: string;
  signatureDataUrl?: string;
  insurers?: string[];
  consent: {
    read?: boolean;
    authorized?: boolean;
    eidas?: boolean;
  };
};

function messageIdFor(kind: "internal" | "receipt", auditId: string): string {
  // Stable Message-ID so /api/contact can thread the consolidated mail via In-Reply-To.
  return `<${kind}-${auditId}@nordanriskpartners.dk>`;
}

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

export async function POST(req: Request) {
  let body: SignRequest;
  try {
    body = (await req.json()) as SignRequest;
  } catch {
    return NextResponse.json({ error: "Ugyldig anmodning." }, { status: 400 });
  }

  // Validate required fields + all three consent boxes
  if (
    !isNonEmpty(body.name) ||
    !isNonEmpty(body.title) ||
    !isNonEmpty(body.email) ||
    !isNonEmpty(body.companyName) ||
    !isNonEmpty(body.cvr) ||
    !isNonEmpty(body.phone) ||
    !body.consent?.read ||
    !body.consent?.authorized ||
    !body.consent?.eidas
  ) {
    return NextResponse.json(
      { error: "Udfyld alle felter og bekræft samtykke før du underskriver." },
      { status: 400 }
    );
  }

  const insurers = Array.isArray(body.insurers)
    ? body.insurers.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : [];

  const signer: SignerData = {
    name: body.name.trim(),
    title: body.title.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || undefined,
    companyName: body.companyName.trim(),
    cvr: body.cvr.trim(),
    signatureDataUrl: body.signatureDataUrl,
  };

  const audit = {
    auditId: crypto.randomUUID(),
    signedAt: new Date().toISOString(),
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "ukendt",
    userAgent: req.headers.get("user-agent") || "ukendt",
    documentHash: await computeOriginalHash(),
  };

  const { pdfBytes, finalHash } = await buildSignedFuldmagtPdf(signer, audit);

  // Track lead — graceful no-op if Supabase isn't configured.
  const leadId = await upsertLead({
    source: "sign",
    status: "partial",
    name: signer.name,
    email: signer.email,
    phone: signer.phone ?? null,
    company: signer.companyName,
    cvr: signer.cvr,
    auditId: audit.auditId,
    payload: {
      title: signer.title,
      insurers,
      finalHash,
    },
  });
  await recordEvent(leadId, "sign_completed", {
    auditId: audit.auditId,
    insurersCount: insurers.length,
  });

  // Upload signed PDF to Blob storage (graceful fail if not configured)
  let blobUrl: string | null = null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const cvrSlug = signer.cvr.replace(/\D/g, "");
      const stamp = audit.signedAt.replace(/[:.]/g, "-");
      const filename = `fuldmagter/${cvrSlug}-${stamp}-${audit.auditId.slice(0, 8)}.pdf`;
      const blob = await put(filename, Buffer.from(pdfBytes), {
        access: "public",
        contentType: "application/pdf",
      });
      blobUrl = blob.url;
    } catch (err) {
      console.error("[sign] Blob upload failed:", err);
    }
  } else {
    console.warn("[sign] BLOB_READ_WRITE_TOKEN not set — skipping permanent storage");
  }

  // Send IMMEDIATE notification — info@ndrp.dk gets the signer's basic data
  // and the signed PDF right away. If they later complete /analyse, /api/contact
  // posts a follow-up that threads under the same conversation via the
  // Message-ID we set here.
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const filename = `Undersogelsesfuldmagt-${signer.companyName.replace(/[^\w]/g, "_")}.pdf`;
      const attachment = { filename, content: Buffer.from(pdfBytes) };
      const signedHuman = new Date(audit.signedAt).toLocaleString("da-DK", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Copenhagen",
      });
      const insurersBlock = insurers.length
        ? `<div style="margin-top:14px;padding:10px 12px;background:#faf7f2;border-left:3px solid #a58878;border-radius:4px;">
             <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#a58878;margin-bottom:6px;">Selskaber kunden er hos</div>
             <div style="font-size:13px;color:#0a0a0a;line-height:1.55;">${insurers.map((s) => s.replace(/[<>&]/g, "")).join(" · ")}</div>
           </div>`
        : "";

      const internalHtml = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;font-size:14px;line-height:1.55;">
<div style="max-width:640px;">
  <div style="font-size:13px;color:#6b6b6b;margin-bottom:6px;">Underskrevet fuldmagt fra nordanriskpartners.dk</div>
  <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:#253f32;">${signer.name} <span style="color:#6b6b6b;font-weight:500;">· ${signer.companyName}</span></h2>

  ${emailKvTable([
    ["Underskriver", `${signer.name}, ${signer.title}`],
    ["Firma", `${signer.companyName} (CVR ${signer.cvr})`],
    ["E-mail", signer.email],
    ...(signer.phone ? [["Telefon", signer.phone] as [string, string]] : []),
    ["Tidspunkt", signedHuman],
    ["Audit-ID", audit.auditId],
    ...(blobUrl ? [["Blob-link", `<a href="${blobUrl}" style="color:#a58878;">åbn permanent kopi</a>`, "html"] as [string, string, "html"]] : []),
  ])}
  ${insurersBlock}

  <hr style="border:none;border-top:1px solid #e6e3df;margin:24px 0 12px;" />
  <div style="font-size:12px;color:#6b6b6b;">
    Hvis kunden uploader policer i flowet kommer de som svar i samme tråd. Reply-to går direkte til underskriver (<a href="mailto:${signer.email}" style="color:#a58878;">${signer.email}</a>).
  </div>
</div>
</body></html>`;
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: signer.email,
        subject: `Underskrevet fuldmagt · ${signer.companyName} (CVR ${signer.cvr})`,
        html: internalHtml,
        attachments: [attachment],
        headers: { "Message-ID": messageIdFor("internal", audit.auditId) },
      });

      const receiptHtml = renderBrandedEmail({
        preheader: "Kvittering for din underskrevne undersøgelsesfuldmagt",
        eyebrow: "Kvittering",
        title: "Tak for din underskrift",
        bodyHtml: `
          <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">Hej ${signer.name.split(" ")[0]},</p>
          <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">
            Vi har modtaget din underskrevne undersøgelsesfuldmagt for <strong>${signer.companyName}</strong>. Den er vedhæftet som PDF — gem den som dokumentation.
          </p>
          ${emailKvTable([
            ["Firma", `${signer.companyName} (CVR ${signer.cvr})`],
            ["Underskriver", `${signer.name}, ${signer.title}`],
            ["Tidspunkt", signedHuman],
            ["Audit-ID", audit.auditId],
          ])}
          <p style="margin:24px 0 8px;font-size:14px;line-height:1.6;color:#6b6b6b;">
            Fuldmagten kan til enhver tid tilbagekaldes skriftligt. Kontakt os på
            <a href="mailto:info@ndrp.dk" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">info@ndrp.dk</a>
            eller <a href="tel:+4553520006" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">+45 53 52 00 06</a>.
          </p>
        `,
      });
      await resend.emails.send({
        from: FROM_EMAIL,
        to: signer.email,
        replyTo: TO_EMAIL,
        subject: "Din underskrevne undersøgelsesfuldmagt — Nordan Risk Partners",
        html: receiptHtml,
        attachments: [attachment],
        headers: { "Message-ID": messageIdFor("receipt", audit.auditId) },
        // Mads' internal mail goes immediately. Customer receipt is delayed
        // a few minutes so it feels like a human review step, not a bot.
        scheduledAt: "in 5 minutes",
      });
    } catch (err) {
      console.error("[sign] Sending receipts failed:", err);
    }
  } else {
    console.warn("[sign] RESEND_API_KEY missing — receipts skipped", {
      auditId: audit.auditId,
      signer: signer.email,
    });
  }

  return NextResponse.json({
    ok: true,
    auditId: audit.auditId,
    signedAt: audit.signedAt,
    finalHash,
    signerName: signer.name,
    signerEmail: signer.email,
    signerPhone: signer.phone ?? null,
    companyName: signer.companyName,
    cvr: signer.cvr,
    insurers,
    internalSubject: `Underskrevet fuldmagt · ${signer.companyName} (CVR ${signer.cvr})`,
    receiptSubject: "Din underskrevne undersøgelsesfuldmagt — Nordan Risk Partners",
    internalMessageId: messageIdFor("internal", audit.auditId),
    receiptMessageId: messageIdFor("receipt", audit.auditId),
    blobUrl,
    fileName: `Undersogelsesfuldmagt-${signer.companyName.replace(/[^\w]/g, "_")}.pdf`,
    mailConfigured: !!RESEND_API_KEY,
    blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}
