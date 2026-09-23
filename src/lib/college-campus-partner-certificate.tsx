import "server-only";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
  Svg,
  Line,
  renderToBuffer,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";

// Same ornate-border design as the "team" kind invitation pass used by Box
// Cricket / Kismat Ke Khiladi Ft. Go Goa Gone (src/lib/invitation-letter.tsx)
// — kept as a standalone file rather than extending that shared one, since
// this is a distinct flow (College Campus Partner, an individual applicant
// rather than a team) with its own table and copy.
const alexBrushFontPath = path.join(
  process.cwd(),
  "public/fonts/AlexBrush-Regular.ttf",
);
Font.register({ family: "Alex Brush", src: alexBrushFontPath });

const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/box_cricket_certificate/certificate-frame.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();
const logoDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/superchamps/ycc-logo-cropped.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Rounded to whole points rather than true A4 landscape (841.89 x 595.28)
// — react-pdf's layout engine has a confirmed bug where a fractional page
// height silently overflows content onto a phantom second page (see
// invitation-letter.tsx's comment on this exact 2000x1414 art).
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const ART_NATIVE_W = 2000;
const ART_NATIVE_H = 1414;
const SCALE_X = PAGE_WIDTH / ART_NATIVE_W;
const SCALE_Y = PAGE_HEIGHT / ART_NATIVE_H;
const ts = (value: number) => value * SCALE_X;
const tsy = (value: number) => value * SCALE_Y;

// Same pixel-scanned safe interior as invitation-letter.tsx's team kind —
// same border artwork, same safe zone.
const SAFE_X = 200;
const SAFE_W = 1600;
const SAFE_Y = 150;

const LOGO_W = 480;
const LOGO_H = (LOGO_W * 301) / 866;
const NAVY = "#173a8f";
const LOGO_BLUE = "#2a5e9a";
const TEXT_DARK = "#2a2118";

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  content: {
    position: "absolute",
    top: tsy(SAFE_Y + 30),
    left: ts(SAFE_X),
    width: ts(SAFE_W),
    alignItems: "center",
  },
  logo: {
    width: ts(LOGO_W),
    height: tsy(LOGO_H),
    marginBottom: tsy(70),
  },
  passTitle: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: ts(32),
    letterSpacing: ts(3),
    color: NAVY,
    marginBottom: tsy(40),
  },
  dearLine: {
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(46),
    letterSpacing: ts(10),
    color: LOGO_BLUE,
  },
  nameLine: {
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(42),
    letterSpacing: ts(10),
    color: NAVY,
  },
  underline: {
    marginTop: tsy(12),
    marginBottom: tsy(32),
  },
  paragraph: {
    width: ts(SAFE_W - 160),
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: ts(21),
    lineHeight: 1.28,
    color: TEXT_DARK,
    marginBottom: tsy(36),
  },
  detailLine: {
    fontFamily: "Helvetica",
    fontSize: ts(18),
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: tsy(14),
  },
  detailLabel: {
    fontFamily: "Helvetica-Bold",
  },
  box: {
    width: ts(760),
    marginTop: tsy(30),
    border: `${ts(1.5)} solid ${NAVY}`,
    borderRadius: ts(6),
    paddingVertical: ts(10),
    paddingHorizontal: ts(18),
  },
  boxTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: ts(18),
    letterSpacing: ts(1.5),
    color: NAVY,
    textAlign: "center",
    marginBottom: ts(6),
  },
  boxRow: {
    fontFamily: "Helvetica",
    fontSize: ts(16),
    lineHeight: 1.3,
    color: TEXT_DARK,
    textAlign: "center",
  },
  code: {
    fontFamily: "Helvetica-Bold",
    fontSize: ts(24),
    letterSpacing: ts(3),
    color: NAVY,
    textAlign: "center",
    marginTop: ts(8),
  },
  closing: {
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(28),
    letterSpacing: ts(3),
    color: LOGO_BLUE,
    marginTop: tsy(40),
  },
  tandc: {
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: ts(9),
    color: "#8a8580",
    marginTop: tsy(28),
  },
});

const UNDERLINE_NATIVE_W = 420;

function Underline() {
  return (
    <Svg
      style={[{ alignSelf: "center" }, styles.underline]}
      width={ts(UNDERLINE_NATIVE_W)}
      height={tsy(6)}
    >
      <Line
        x1={0}
        y1={tsy(3)}
        x2={ts(UNDERLINE_NATIVE_W)}
        y2={tsy(3)}
        stroke={LOGO_BLUE}
        strokeWidth={ts(2.5)}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export interface CollegeCampusPartnerCertificateData {
  name: string;
  code: string;
  collegeName: string;
  stream: string;
  year: number;
  semester: number;
}

export function CollegeCampusPartnerCertificatePage({
  name,
  code,
  collegeName,
  stream,
  year,
  semester,
}: CollegeCampusPartnerCertificateData) {
  return (
    <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      <View style={styles.content}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={logoDataUri} style={styles.logo} />

        <Text style={styles.passTitle}>OFFICIAL CAMPUS PARTNER PASS</Text>

        <Text style={styles.dearLine}>Dear,</Text>
        <Text style={styles.nameLine}>{name}</Text>
        <Underline />

        <Text style={styles.paragraph}>
          Congratulations! You&apos;ve been officially welcomed as a YCC
          College Campus Partner for the Kismat Ke Khiladi Ft. Go, Goa, Gone
          campaign. We&apos;re excited to have you on board — your energy
          and reach on campus is exactly what makes this campaign a success.
        </Text>

        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>College: </Text>
          {collegeName}
        </Text>
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>Stream: </Text>
          {stream}
        </Text>
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>Year / Semester: </Text>
          {year} / Sem {semester}
        </Text>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Your Code</Text>
          <Text style={styles.boxRow}>
            Keep this certificate handy — your code below is your personal
            identifier with YCC.
          </Text>
          <Text style={styles.code}>{code}</Text>
        </View>

        <Text style={[styles.paragraph, { marginTop: tsy(50), marginBottom: 0 }]}>
          For all campaign targets, updates, and announcements, stay
          connected with our official social media channels.
        </Text>

        <Text style={styles.closing}>Welcome aboard!</Text>

        <Text style={styles.tandc}>T&amp;C Applied</Text>
      </View>
    </Page>
  );
}

export async function renderCollegeCampusPartnerCertificatePdf(
  data: CollegeCampusPartnerCertificateData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <CollegeCampusPartnerCertificatePage {...data} />
    </Document>,
  );
}
