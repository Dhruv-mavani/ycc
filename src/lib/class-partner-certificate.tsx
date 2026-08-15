import "server-only";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { InvitationLetterPage } from "@/lib/invitation-letter";

export interface ClassPartnerCertificateData {
  name: string;
  teamCode: string;
  qrDataUrl: string;
  /** Kept for the route's typing; the invitation letter's wording no
   * longer varies by partner type. */
  partnerType?: "campus" | "class";
}

function ClassPartnerCertificateDocument({
  data,
}: {
  data: ClassPartnerCertificateData;
}) {
  return (
    <Document>
      <InvitationLetterPage
        name={data.name}
        qrDataUrl={data.qrDataUrl}
        code={data.teamCode}
      />
    </Document>
  );
}

export async function renderClassPartnerCertificatePdf(
  data: ClassPartnerCertificateData,
): Promise<Buffer> {
  return renderToBuffer(<ClassPartnerCertificateDocument data={data} />);
}
