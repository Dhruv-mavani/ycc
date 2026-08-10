import "server-only";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";

// Same fs.readFileSync trick used for the receipt logo — a statically
// analyzable path lets Next's file tracing bundle these into the
// serverless function on Vercel; react-pdf's own file resolution isn't
// reliably traced there.
const backgroundDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/brand/class-partner-certificate.jpeg"),
  );
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
})();

const alexBrushFontPath = path.join(
  process.cwd(),
  "public/fonts/AlexBrush-Regular.ttf",
);

Font.register({ family: "Alex Brush", src: alexBrushFontPath });

// Native pixel size of assets/classpartner_certificate.jpeg — the page is
// sized to match exactly so every overlay coordinate below maps 1:1 to a
// pixel in that image.
const PAGE_WIDTH = 1600;
const PAGE_HEIGHT = 753;

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  // Patches to blank out the template's baked-in "Dear Captain" text and
  // barcode so dynamic content can be drawn in the same spot. The template
  // background there is a near-white halftone — solid white is a close
  // enough match to read as seamless.
  greetingPatch: {
    position: "absolute",
    top: 116,
    left: 738,
    width: 462,
    height: 78,
    backgroundColor: "#ffffff",
  },
  greetingText: {
    position: "absolute",
    top: 128,
    left: 738,
    width: 462,
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: 40,
    color: "#1d4ed8",
  },
  nameText: {
    position: "absolute",
    top: 216,
    left: 738,
    width: 462,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    color: "#0f172a",
  },
  codePatch: {
    position: "absolute",
    top: 418,
    left: 1240,
    width: 310,
    height: 178,
    backgroundColor: "#ffffff",
  },
  qr: {
    position: "absolute",
    top: 428,
    left: 1332,
    width: 126,
    height: 126,
  },
  codeText: {
    position: "absolute",
    top: 558,
    left: 1240,
    width: 310,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    color: "#0f172a",
  },
});

export interface ClassPartnerCertificateData {
  name: string;
  teamCode: string;
  qrDataUrl: string;
}

function ClassPartnerCertificateDocument({
  data,
}: {
  data: ClassPartnerCertificateData;
}) {
  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={backgroundDataUri} style={styles.background} />

        <View style={styles.greetingPatch} />
        <Text style={styles.greetingText}>Dear Class Partner</Text>
        <Text style={styles.nameText}>{data.name}</Text>

        <View style={styles.codePatch} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={data.qrDataUrl} style={styles.qr} />
        <Text style={styles.codeText}>{data.teamCode}</Text>
      </Page>
    </Document>
  );
}

export async function renderClassPartnerCertificatePdf(
  data: ClassPartnerCertificateData,
): Promise<Buffer> {
  return renderToBuffer(<ClassPartnerCertificateDocument data={data} />);
}
