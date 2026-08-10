import "server-only";
import {
  Document,
  Page,
  Text,
  Image,
  Font,
  StyleSheet,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Line,
  Path,
  Polygon,
  renderToBuffer,
} from "@react-pdf/renderer";
import path from "node:path";
import { LEFT_ILLUSTRATION_PATHS } from "@/lib/class-partner-certificate-art";

// Statically analyzable path so Next's file tracing bundles the font into
// the serverless function on Vercel; react-pdf's own file resolution isn't
// reliably traced there.
const alexBrushFontPath = path.join(
  process.cwd(),
  "public/fonts/AlexBrush-Regular.ttf",
);

Font.register({ family: "Alex Brush", src: alexBrushFontPath });

// Whole certificate is drawn with react-pdf's SVG primitives instead of a
// background image — every color, shape and line lives here in code, so the
// design can be tweaked (colors, wording, layout) without touching an
// external asset.
const PAGE_WIDTH = 1600;
const PAGE_HEIGHT = 753;

const M = 30; // outer margin around the ticket card
const CARD_X = M;
const CARD_Y = M;
const CARD_W = PAGE_WIDTH - 2 * M;
const CARD_H = PAGE_HEIGHT - 2 * M;
const CARD_RX = 18;

const STUB_W = 310;
const SEAM_X = CARD_X + CARD_W - STUB_W;

const GOLD = "#c9a227";
const GOLD_BRIGHT = "#f0cd6a";
const NAVY_DARK = "#0a1740";
const NAVY_LIGHT = "#1c3a7a";
const BLUE = "#1d4ed8";
const BLUE_DEEP = "#173a8f";
const TEXT_DARK = "#0f172a";
const WHITE = "#ffffff";
const GRAY_TEXT = "#475569";

// 5-point star polygon (point-up), used for the stub's decorative stars.
function starPoints(cx: number, cy: number, outerR: number): string {
  const innerR = outerR * 0.42;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

const styles = StyleSheet.create({
  page: { position: "relative", fontFamily: "Helvetica" },
  greeting: {
    position: "absolute",
    top: 44,
    left: 560,
    width: 670,
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: 36,
    color: BLUE,
  },
  name: {
    position: "absolute",
    top: 138,
    left: 560,
    width: 670,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 19,
    color: TEXT_DARK,
  },
  body: {
    position: "absolute",
    top: 320,
    left: 460,
    width: 770,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 14.5,
    lineHeight: 1.55,
    color: BLUE_DEEP,
  },
  codeLabel: {
    position: "absolute",
    top: 440,
    left: 460,
    width: 770,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 12,
    color: GRAY_TEXT,
  },
  codeValue: {
    position: "absolute",
    top: 460,
    left: 460,
    width: 770,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    letterSpacing: 2,
    color: TEXT_DARK,
  },
  stubYcc: {
    position: "absolute",
    top: 78,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 32,
    letterSpacing: 1,
    color: WHITE,
  },
  stubYccSub: {
    position: "absolute",
    top: 124,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 2.5,
    color: WHITE,
  },
  stubExclusive: {
    position: "absolute",
    top: 168,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    letterSpacing: 3,
    color: GOLD_BRIGHT,
  },
  stubPass1: {
    position: "absolute",
    top: 184,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 19,
    color: GOLD_BRIGHT,
  },
  stubPass2: {
    position: "absolute",
    top: 208,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 19,
    color: GOLD_BRIGHT,
  },
  qr: {
    position: "absolute",
    top: 274,
    left: SEAM_X + 80,
    width: 150,
    height: 150,
  },
  stubCodeLabel: {
    position: "absolute",
    top: 448,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: GOLD_BRIGHT,
  },
  stubCodeValue: {
    position: "absolute",
    top: 464,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    letterSpacing: 1,
    color: WHITE,
  },
  stubMotto: {
    position: "absolute",
    top: 655,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 1,
    color: GOLD_BRIGHT,
  },
});

function CertificateArt() {
  return (
    <Svg width={PAGE_WIDTH} height={PAGE_HEIGHT}>
      <Defs>
        <LinearGradient id="stubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={NAVY_LIGHT} />
          <Stop offset="100%" stopColor={NAVY_DARK} />
        </LinearGradient>
      </Defs>

      {/* Outer ticket card */}
      <Rect
        x={CARD_X}
        y={CARD_Y}
        width={CARD_W}
        height={CARD_H}
        rx={CARD_RX}
        fill={WHITE}
        stroke={GOLD}
        strokeWidth={2.5}
      />

      {/* Decorative artwork traced from the original certificate template
          (see class-partner-certificate-art.ts) — trophy/wordmark,
          batsman/floodlights/dust, the wave and the ball-with-motion-
          streak are real vector paths lifted from the source design, each
          keeping its own native fill color (shading/highlights included)
          rather than being flattened to one blue. Coordinates already sit
          in this page's 1600x753 space, clear of the card's rounded
          corners, so no clipPath or extra transform is needed (react-pdf's
          clipPath, when the clip rect's origin isn't (0,0), corrupts
          rotate-transform math on descendants). */}
      {LEFT_ILLUSTRATION_PATHS.map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}

      {/* Greeting ornament: short line - diamond - line, plus a full
          divider underneath, framing the recipient name. */}
      <Line x1={765} y1={104} x2={1025} y2={104} stroke={BLUE_DEEP} strokeWidth={1} />
      <Circle cx={780} cy={104} r={2.5} fill={BLUE_DEEP} />
      <Circle cx={1010} cy={104} r={2.5} fill={BLUE_DEEP} />
      <Rect x={891} y={100} width={8} height={8} fill={WHITE} stroke={BLUE_DEEP} strokeWidth={1} transform="rotate(45 895 104)" />
      <Line x1={560} y1={128} x2={1230} y2={128} stroke={BLUE_DEEP} strokeWidth={1} />

      {/* Ticket seam: dashed divider with punched notches, top & bottom */}
      <Line
        x1={SEAM_X}
        y1={CARD_Y + 26}
        x2={SEAM_X}
        y2={CARD_Y + CARD_H - 26}
        stroke={GOLD}
        strokeWidth={1.5}
        strokeDasharray="8,7"
      />
      <Circle cx={SEAM_X} cy={CARD_Y} r={15} fill={WHITE} stroke={GOLD} strokeWidth={1.5} />
      <Circle cx={SEAM_X} cy={CARD_Y + CARD_H} r={15} fill={WHITE} stroke={GOLD} strokeWidth={1.5} />

      {/* Stub panel */}
      <Rect x={SEAM_X} y={CARD_Y} width={STUB_W} height={CARD_H} rx={CARD_RX} fill="url(#stubGrad)" />
      <Rect
        x={SEAM_X + 10}
        y={CARD_Y + 10}
        width={STUB_W - 20}
        height={CARD_H - 20}
        rx={10}
        fill="none"
        stroke={GOLD}
        strokeWidth={1}
      />

      <Polygon points={starPoints(SEAM_X + 105, CARD_Y + 42, 8)} fill={GOLD_BRIGHT} />
      <Polygon points={starPoints(SEAM_X + 155, CARD_Y + 42, 10)} fill={GOLD_BRIGHT} />
      <Polygon points={starPoints(SEAM_X + 205, CARD_Y + 42, 8)} fill={GOLD_BRIGHT} />

      <Line x1={SEAM_X + 40} y1={158} x2={SEAM_X + 270} y2={158} stroke={GOLD} strokeWidth={1} />

      <Rect
        x={SEAM_X + 55}
        y={260}
        width={200}
        height={170}
        rx={12}
        fill={WHITE}
        stroke={GOLD}
        strokeWidth={1.5}
      />

      <Line x1={SEAM_X + 40} y1={648} x2={SEAM_X + 270} y2={648} stroke={GOLD} strokeWidth={1} />
      <Polygon points={starPoints(SEAM_X + 155, CARD_Y + 663, 10)} fill={GOLD_BRIGHT} />
    </Svg>
  );
}

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
        <CertificateArt />

        <Text style={styles.greeting}>Dear Class Partner</Text>
        <Text style={styles.name}>{data.name}</Text>

        <Text style={styles.body}>
          You are warmly invited to serve as a Class Partner for our
          Exclusive YCC Cricket League — Box Cricket Tournament. Your
          leadership and your classmates&apos; participation will make this
          tournament even more special.
        </Text>

        <Text style={styles.codeLabel}>Your Team Code</Text>
        <Text style={styles.codeValue}>{data.teamCode}</Text>

        <Text style={styles.stubYcc}>YCC</Text>
        <Text style={styles.stubYccSub}>CRICKET LEAGUE</Text>
        <Text style={styles.stubExclusive}>EXCLUSIVE</Text>
        <Text style={styles.stubPass1}>CLASS PARTNER</Text>
        <Text style={styles.stubPass2}>PASS</Text>

        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={data.qrDataUrl} style={styles.qr} />
        <Text style={styles.stubCodeLabel}>TEAM CODE</Text>
        <Text style={styles.stubCodeValue}>{data.teamCode}</Text>

        <Text style={styles.stubMotto}>CRICKET • COMMUNITY • CHAMPION</Text>
      </Page>
    </Document>
  );
}

export async function renderClassPartnerCertificatePdf(
  data: ClassPartnerCertificateData,
): Promise<Buffer> {
  return renderToBuffer(<ClassPartnerCertificateDocument data={data} />);
}
