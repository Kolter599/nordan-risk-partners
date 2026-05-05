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
  emailCard,
  EMAIL_COLORS,
} from "@/lib/email-template";

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
  consent: {
    read?: boolean;
    authorized?: boolean;
    eidas?: boolean;
  };
};

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
    !body.consent?.read ||
    !body.consent?.authorized ||
    !body.consent?.eidas
  ) {
    return NextResponse.json(
      { error: "Udfyld alle felter og bekræft samtykke før du underskriver." },
      { status: 400 }
    );
  }

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

  // Send receipt emails via Resend (graceful fail if not configured)
  let emailSent = false;
  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const subject = `Underskrevet undersøgelsesfuldmagt · ${signer.companyName} (CVR ${signer.cvr})`;
      const filename = `Undersogelsesfuldmagt-${signer.companyName.replace(/[^\w]/g, "_")}.pdf`;
      const attachment = {
        filename,
        content: Buffer.from(pdfBytes),
      };

      const signedHuman = new Date(audit.signedAt).toLocaleString("da-DK", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Copenhagen",
      });

      // To Nordan — branded internal notification
      const internalHtml = renderBrandedEmail({
        preheader: `${signer.name} har underskrevet en undersøgelsesfuldmagt for ${signer.companyName}`,
        eyebrow: "Ny underskrift",
        title: "Underskrevet undersøgelsesfuldmagt",
        bodyHtml: `
          <p style="margin:0 0 16px;font-size:15.5px;line-height:1.65;">
            ${signer.name} har netop underskrevet en undersøgelsesfuldmagt elektronisk. PDF'en er vedhæftet.
          </p>
          ${emailKvTable([
            ["Underskriver", `${signer.name}, ${signer.title}`],
            ["Firma", `${signer.companyName} (CVR ${signer.cvr})`],
            ["E-mail", signer.email],
            ...(signer.phone ? [["Telefon", signer.phone] as [string, string]] : []),
            ["Tidspunkt", signedHuman],
            ["IP", audit.ip],
          ])}
          ${emailCard(`
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Audit-data</div>
            <div style="font-family:Menlo,Consolas,monospace;font-size:12px;color:${EMAIL_COLORS.ink};line-height:1.7;">
              <strong>ID:</strong> ${audit.auditId}<br/>
              <strong>Final hash:</strong> ${finalHash.slice(0, 16)}…<br/>
              ${blobUrl ? `<strong>Blob:</strong> <a href="${blobUrl}" style="color:${EMAIL_COLORS.accent};">åbn permanent kopi</a>` : ""}
            </div>
          `, { tone: "soft" })}
        `,
      });
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: signer.email,
        subject,
        html: internalHtml,
        text:
          `Ny underskrevet undersøgelsesfuldmagt\n\n` +
          `Underskriver: ${signer.name} (${signer.title})\n` +
          `Firma: ${signer.companyName} (CVR ${signer.cvr})\n` +
          `E-mail: ${signer.email}${signer.phone ? `\nTelefon: ${signer.phone}` : ""}\n` +
          `Tidspunkt: ${audit.signedAt}\n` +
          `IP: ${audit.ip}\n` +
          `Audit-ID: ${audit.auditId}\n` +
          `Final hash: ${finalHash}\n` +
          (blobUrl ? `\nBlob-URL: ${blobUrl}\n` : ""),
        attachments: [attachment],
      });

      // To signer — branded receipt
      const receiptHtml = renderBrandedEmail({
        preheader: "Kvittering for din underskrevne undersøgelsesfuldmagt",
        eyebrow: "Kvittering",
        title: "Tak for din underskrift",
        bodyHtml: `
          <p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;">
            Hej ${signer.name.split(" ")[0]},
          </p>
          <p style="margin:0 0 18px;font-size:15.5px;line-height:1.65;">
            Vi har modtaget din underskrevne undersøgelsesfuldmagt for <strong>${signer.companyName}</strong>. Den vedhæftes som PDF i denne mail — gem den som dokumentation.
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
        subject: "Kvittering · din underskrevne undersøgelsesfuldmagt",
        html: receiptHtml,
        attachments: [attachment],
      });

      emailSent = true;
    } catch (err) {
      console.error("[sign] Email send failed:", err);
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
    blobUrl,
    fileName: `Undersogelsesfuldmagt-${signer.companyName.replace(/[^\w]/g, "_")}.pdf`,
    emailSent,
    mailConfigured: !!RESEND_API_KEY,
    blobConfigured: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}
