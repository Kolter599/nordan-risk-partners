import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import {
  buildSignedFuldmagtPdf,
  computeOriginalHash,
  type SignerData,
} from "@/lib/fuldmagt-pdf";

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

      // To Nordan
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: signer.email,
        subject,
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

      // To signer (receipt copy)
      await resend.emails.send({
        from: FROM_EMAIL,
        to: signer.email,
        subject: "Kvittering: din underskrevne undersøgelsesfuldmagt",
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a;">
            <h2 style="font-weight:600;color:#253f32;margin:0 0 8px 0;">Tak for din underskrift</h2>
            <p style="color:#404040;line-height:1.55;">
              Vi har modtaget din underskrevne undersøgelsesfuldmagt.
              Den vedhæftes som PDF i denne mail som dokumentation.
            </p>
            <table style="border-collapse:collapse;margin-top:16px;color:#0a0a0a;">
              <tr><td style="padding:6px 0;color:#6b6b6b;width:140px;">Firma</td><td style="padding:6px 0;">${signer.companyName} (CVR ${signer.cvr})</td></tr>
              <tr><td style="padding:6px 0;color:#6b6b6b;">Underskriver</td><td style="padding:6px 0;">${signer.name}, ${signer.title}</td></tr>
              <tr><td style="padding:6px 0;color:#6b6b6b;">Tidspunkt</td><td style="padding:6px 0;">${new Date(audit.signedAt).toLocaleString("da-DK", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Copenhagen" })}</td></tr>
              <tr><td style="padding:6px 0;color:#6b6b6b;">Audit-ID</td><td style="padding:6px 0;font-family:monospace;font-size:12px;">${audit.auditId}</td></tr>
            </table>
            <p style="color:#6b6b6b;font-size:12px;line-height:1.5;margin-top:24px;">
              Fuldmagten kan til enhver tid tilbagekaldes skriftligt. Kontakt os på
              <a href="mailto:info@ndrp.dk" style="color:#a58878;">info@ndrp.dk</a>.
            </p>
          </div>
        `,
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
