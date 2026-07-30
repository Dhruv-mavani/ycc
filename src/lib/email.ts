import "server-only";
import { Resend } from "resend";

// Instantiated lazily (not at module scope) so builds/imports don't throw
// before RESEND_API_KEY is configured.
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendReceiptEmail({
  to,
  subject,
  html,
  pdfBuffer,
  filename,
}: {
  to: string;
  subject: string;
  html: string;
  pdfBuffer: Buffer;
  filename: string;
}) {
  await getResendClient().emails.send({
    from: process.env.RECEIPT_FROM_EMAIL!,
    to,
    subject,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });
}
