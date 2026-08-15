import "server-only";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { InvitationLetterPage } from "@/lib/invitation-letter";

export interface ClassPartnerCertificateData {
  name: string;
  teamCode: string;
  qrDataUrl: string;
  partnerType: "campus" | "class";
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
        partnerType={data.partnerType}
      />
    </Document>
  );
}

export async function renderClassPartnerCertificatePdf(
  data: ClassPartnerCertificateData,
): Promise<Buffer> {
  return renderToBuffer(<ClassPartnerCertificateDocument data={data} />);
}
