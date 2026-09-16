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

// Placeholder design for YCC Jackpot Heist — reuses the Super Champs
// certificate's generic blue top/bottom bars (superchamps_certificate2.png)
// and logo crop, just retitled, until real Jackpot Heist art is provided
// (drop it in /assets and swap bgDataUri below, same as was done for the
// Box Cricket invitation letter).
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
// Rounded to whole points rather than true A4 (841.89x595.28) — react-pdf's
// layout engine has a confirmed bug where a fractional page height
// silently overflows content onto a phantom second page (see
// superchamps-certificate.tsx, where this was first bisected, and
// invitation-letter.tsx's team page, which hit the exact same bug).
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const SCALE_X = PAGE_WIDTH / ART_NATIVE_W;
const SCALE_Y = PAGE_HEIGHT / ART_NATIVE_H;
const s = (value: number) => value * SCALE_X;
const sy = (value: number) => value * SCALE_Y;

const BLOCK_X = 200;
const BLOCK_W = 1600;

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
  program: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(60),
    color: ACCENT_BLUE,
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

export interface MoneyHeistCertificateData {
  name: string;
  code: string;
}

function MoneyHeistCertificatePage({ data }: { data: MoneyHeistCertificateData }) {
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

      <Text style={[styles.subtitle, { top: sy(628) }]}>
        has successfully registered for
      </Text>

      <Text style={[styles.program, { top: sy(700) }]}>YCC Jackpot Heist</Text>

      <View style={[styles.noticeBox, { top: sy(830) }]}>
        <Text style={styles.noticeTitle}>Personalized Code</Text>
        <Text style={styles.noticeBody}>
          This unique code is your entry ID — carry this certificate (print
          or PDF) to the venue for check-in.
        </Text>
      </View>

      <Text style={[styles.code, { top: sy(995) }]}>{data.code}</Text>

      <Text style={[styles.closing, { top: sy(1080) }]}>Good luck!</Text>
    </Page>
  );
}

export async function renderMoneyHeistCertificatePdf(
  data: MoneyHeistCertificateData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <MoneyHeistCertificatePage data={data} />
    </Document>,
  );
}
