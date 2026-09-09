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

// Dedicated design for YCC Super Champs only — plain blue top/bottom bars
// (superchamps_certificate2.png), distinct from the shared envelope/card
// background used by the team/partner certificates in invitation-letter.tsx.
const alexBrushFontPath = path.join(
  process.cwd(),
  "public/fonts/AlexBrush-Regular.ttf",
);
Font.register({ family: "Alex Brush", src: alexBrushFontPath });

const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/superchamps/certificate-bg.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Tightly cropped from public/brand/ycc-logo-bgless.png (that file is a
// 1024x1024 canvas with the actual trophy+wordmark lockup sitting in a
// narrow horizontal band in the middle — cropped once, ahead of time, via
// an alpha-threshold bounding box, so it doesn't render tiny with huge
// invisible padding here).
const logoDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/superchamps/ycc-logo-cropped.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();
const LOGO_NATIVE_W = 866;
const LOGO_NATIVE_H = 301;

const ART_NATIVE_W = 2000;
const ART_NATIVE_H = 1414;
// Native art is already ~A4 ratio (2000x1414 = 1.4144 vs A4's 1.4142) — a
// virtually exact match, so no visible stretch. Rounded to whole points
// (A4 is technically 841.89x595.28): react-pdf's layout engine has a bug
// where a fractional page height silently overflows content onto a
// phantom second page (confirmed by bisection — 595 renders one page,
// 595.28 renders two, with byte-identical content otherwise).
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const SCALE_X = PAGE_WIDTH / ART_NATIVE_W;
const SCALE_Y = PAGE_HEIGHT / ART_NATIVE_H;
const s = (value: number) => value * SCALE_X;
const sy = (value: number) => value * SCALE_Y;

// The writable area — pixel-scanned for the worst-case (deepest) intrusion
// of the top/bottom bars across this x-range: still blank down to y=107
// at the widest point, and up to y=1292 from the bottom, so 110/1288
// clears both with a small buffer.
const BLOCK_X = 200;
const BLOCK_W = 1600;

// Rendered width of "Certificate of Registration" at Helvetica-Bold, size
// 60 (the title's own font/size, in the same native units as everything
// else) — measured once via `new (require("@react-pdf/pdfkit").default)()
// .font("Helvetica-Bold").fontSize(60).widthOfString(...)`, not eyeballed,
// so the underline below the name matches it exactly rather than
// approximately.
const TITLE_TEXT_WIDTH = 734.64;

const NAVY = "#0d3b66";
const ACCENT_BLUE = "#0477cd";
const TEXT_DARK = "#26314f";

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  logo: {
    position: "absolute",
    top: sy(130),
    left: (PAGE_WIDTH - s(400)) / 2,
    width: s(400),
    height: s(400) * (LOGO_NATIVE_H / LOGO_NATIVE_W),
  },
  title: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(60),
    color: NAVY,
  },
  subtitle: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: s(32),
    color: TEXT_DARK,
  },
  name: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(58),
    color: NAVY,
  },
  // Centered under the name, sized to exactly match the rendered width of
  // "Certificate of Registration" (measured once via
  // @react-pdf/pdfkit's widthOfString at Helvetica-Bold/60 — the title's
  // own font/size — then scaled the same way as everything else here).
  nameUnderline: {
    position: "absolute",
    left: (PAGE_WIDTH - s(TITLE_TEXT_WIDTH)) / 2,
    width: s(TITLE_TEXT_WIDTH),
    borderBottomWidth: s(3),
    borderBottomColor: ACCENT_BLUE,
  },
  program: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(60),
    color: ACCENT_BLUE,
  },
  paragraph: {
    position: "absolute",
    left: s(BLOCK_X + 150),
    width: s(BLOCK_W - 300),
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: s(30),
    lineHeight: 1.4,
    color: TEXT_DARK,
  },
  noticeBox: {
    position: "absolute",
    left: s(BLOCK_X + 300),
    width: s(BLOCK_W - 600),
    border: `${s(2)} solid ${ACCENT_BLUE}`,
    borderRadius: s(6),
    paddingVertical: s(18),
    paddingHorizontal: s(20),
  },
  noticeTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: s(23),
    letterSpacing: s(1),
    color: NAVY,
    textAlign: "center",
    marginBottom: s(9),
  },
  noticeBody: {
    fontFamily: "Helvetica",
    fontSize: s(21),
    lineHeight: 1.4,
    color: TEXT_DARK,
    textAlign: "center",
  },
  code: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(37),
    letterSpacing: s(2),
    color: NAVY,
  },
  closing: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: s(53),
    color: NAVY,
  },
});

export interface SuperChampsCertificateData {
  name: string;
  code: string;
}

function SuperChampsCertificatePage({ data }: { data: SuperChampsCertificateData }) {
  return (
    <Page size={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={logoDataUri} style={styles.logo} />

      <Text style={[styles.title, { top: sy(340) }]}>Certificate of Registration</Text>

      <Text style={[styles.subtitle, { top: sy(450) }]}>
        This is to officially certify that
      </Text>

      <Text style={[styles.name, { top: sy(522) }]}>{data.name}</Text>
      <View style={[styles.nameUnderline, { top: sy(600) }]} />

      <Text style={[styles.subtitle, { top: sy(628) }]}>
        has successfully registered with
      </Text>

      <Text style={[styles.program, { top: sy(700) }]}>YCC Super Champs Program</Text>

      <Text style={[styles.paragraph, { top: sy(790) }]}>
        We are pleased to welcome you to our community and look forward to
        providing meaningful opportunities across sports, education,
        cultural activities &amp; personal development.
      </Text>

      <View style={[styles.noticeBox, { top: sy(910) }]}>
        <Text style={styles.noticeTitle}>Personalized Code</Text>
        <Text style={styles.noticeBody}>
          This unique code serves as your ID for all future registrations and entries.
        </Text>
      </View>

      <Text style={[styles.code, { top: sy(1075) }]}>{data.code}</Text>

      <Text style={[styles.closing, { top: sy(1155) }]}>Welcome to YCC.</Text>
    </Page>
  );
}

export async function renderSuperChampsCertificatePdf(
  data: SuperChampsCertificateData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <SuperChampsCertificatePage data={data} />
    </Document>,
  );
}
