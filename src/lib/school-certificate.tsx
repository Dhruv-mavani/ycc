import "server-only";
import { Document, renderToBuffer } from "@react-pdf/renderer";
import { InvitationLetterPage } from "@/lib/invitation-letter";

export interface SchoolCertificateData {
  name: string;
  code: string;
  eventName: string;
}

function SchoolCertificateDocument({ data }: { data: SchoolCertificateData }) {
  return (
    <Document>
      <InvitationLetterPage
        kind="school"
        name={data.name}
        code={data.code}
        eventName={data.eventName}
      />
    </Document>
  );
}

export async function renderSchoolCertificatePdf(
  data: SchoolCertificateData,
): Promise<Buffer> {
  return renderToBuffer(<SchoolCertificateDocument data={data} />);
}
