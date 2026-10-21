import "server-only";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { InvitationLetterPage } from "@/lib/invitation-letter";

export interface ClassPartnerCertificateData {
  name: string;
  teamCode: string;
  partnerType: "campus" | "class" | "classmate";
}

function ClassPartnerCertificateDocument({
  data,
}: {
  data: ClassPartnerCertificateData;
}) {
  return (
    <Document>
      <InvitationLetterPage
        kind="partner"
        name={data.name}
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
