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
//
// Every position below (card/stub bounds, text block boxes) was measured
// directly off a clean, non-traced reference render of the source design
// (classpartner_certificate2.png, 1536x1024) with a pixel-scanning script —
// not eyeballed — specifically so positions stop drifting on every edit.
// The page dimensions match that reference exactly, so LEFT_ILLUSTRATION_PATHS
// (traced from the companion SVG) needs no rescale either.
const PAGE_WIDTH = 1536;
const PAGE_HEIGHT = 1024;

const CARD_X = 25;
const CARD_Y = 35;
const CARD_W = 1475;
const CARD_H = 926;
const CARD_RX = 35;

const STUB_W = 350;
const SEAM_X = CARD_X + CARD_W - STUB_W; // 1150

// Shared column for the greeting/name block, matching the ornament
// divider's measured span (695–1108).
const GCOL_X = 695;
const GCOL_W = 413;

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

const STUB_BOX_X = SEAM_X + 30;
const STUB_BOX_Y = 550;
const STUB_BOX_W = STUB_W - 60;
const STUB_BOX_H = 215;

const styles = StyleSheet.create({
  page: { position: "relative", fontFamily: "Helvetica" },
  greeting: {
    position: "absolute",
    top: 140,
    left: GCOL_X - 40,
    width: GCOL_W + 80,
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: 46,
    color: BLUE,
  },
  name: {
    position: "absolute",
    top: 345,
    left: GCOL_X,
    width: GCOL_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    color: TEXT_DARK,
  },
  body: {
    position: "absolute",
    top: 440,
    left: 380,
    width: 720,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 27,
    lineHeight: 1.5,
    color: BLUE_DEEP,
  },
  codeLabel: {
    position: "absolute",
    top: 748,
    left: 460,
    width: 600,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 22,
    color: GRAY_TEXT,
  },
  codeValue: {
    position: "absolute",
    top: 785,
    left: 460,
    width: 600,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 46,
    letterSpacing: 3,
    color: TEXT_DARK,
  },
  stubYcc: {
    position: "absolute",
    top: 148,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 92,
    letterSpacing: 1,
    color: WHITE,
  },
  stubYccSub: {
    position: "absolute",
    top: 278,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 25,
    letterSpacing: 3,
    color: WHITE,
  },
  stubExclusive: {
    position: "absolute",
    top: 368,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    letterSpacing: 4,
    color: GOLD_BRIGHT,
  },
  stubPass1: {
    position: "absolute",
    top: 402,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 38,
    color: GOLD_BRIGHT,
  },
  stubPass2: {
    position: "absolute",
    top: 450,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 38,
    color: GOLD_BRIGHT,
  },
  qr: {
    position: "absolute",
    top: STUB_BOX_Y + 15,
    left: STUB_BOX_X + (STUB_BOX_W - 150) / 2,
    width: 150,
    height: 150,
  },
  stubCodeValue: {
    position: "absolute",
    top: STUB_BOX_Y + 182,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    letterSpacing: 2,
    color: TEXT_DARK,
  },
  stubMotto: {
    position: "absolute",
    top: 815,
    left: SEAM_X,
    width: STUB_W,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    letterSpacing: 0.5,
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
        strokeWidth={3}
      />

      {/* Decorative artwork traced from the source design (see
          class-partner-certificate-art.ts) — trophy/wordmark, batsman/
          floodlights/dust, wave, ornament dividers and the ball-with-
          motion-streak are real vector paths, each keeping its own
          native fill color. This page's dimensions match that source's
          native canvas exactly, so the paths land pixel-for-pixel with
          no rescale. No clipPath is used for containment (react-pdf's
          clipPath, when the clip rect's origin isn't (0,0), corrupts
          rotate-transform math on descendants) — coordinates just stay
          clear of the card's rounded corners. */}
      {LEFT_ILLUSTRATION_PATHS.map((p) => (
        <Path key={p.d} d={p.d} fill={p.fill} />
      ))}

      {/* Ticket seam: dashed divider with punched notches, top & bottom */}
      <Line
        x1={SEAM_X}
        y1={CARD_Y + 32}
        x2={SEAM_X}
        y2={CARD_Y + CARD_H - 32}
        stroke={GOLD}
        strokeWidth={2}
        strokeDasharray="10,9"
      />
      <Circle cx={SEAM_X} cy={CARD_Y} r={18} fill={WHITE} stroke={GOLD} strokeWidth={2} />
      <Circle cx={SEAM_X} cy={CARD_Y + CARD_H} r={18} fill={WHITE} stroke={GOLD} strokeWidth={2} />

      {/* Stub panel */}
      <Rect x={SEAM_X} y={CARD_Y} width={STUB_W} height={CARD_H} rx={CARD_RX} fill="url(#stubGrad)" />
      <Rect
        x={SEAM_X + 12}
        y={CARD_Y + 12}
        width={STUB_W - 24}
        height={CARD_H - 24}
        rx={22}
        fill="none"
        stroke={GOLD}
        strokeWidth={1.5}
      />

      <Polygon points={starPoints(SEAM_X + 125, 121, 10)} fill={GOLD_BRIGHT} />
      <Polygon points={starPoints(SEAM_X + 175, 121, 13)} fill={GOLD_BRIGHT} />
      <Polygon points={starPoints(SEAM_X + 225, 121, 10)} fill={GOLD_BRIGHT} />

      <Line x1={SEAM_X + 35} y1={355} x2={SEAM_X + 315} y2={355} stroke={GOLD} strokeWidth={1.5} />

      <Rect
        x={STUB_BOX_X}
        y={STUB_BOX_Y}
        width={STUB_BOX_W}
        height={STUB_BOX_H}
        rx={16}
        fill={WHITE}
        stroke={GOLD}
        strokeWidth={2}
      />

      <Line x1={SEAM_X + 35} y1={790} x2={SEAM_X + 315} y2={790} stroke={GOLD} strokeWidth={1.5} />
      <Polygon points={starPoints(SEAM_X + 175, 875, 13)} fill={GOLD_BRIGHT} />
    </Svg>
  );
}

export interface ClassPartnerCertificateData {
  name: string;
  teamCode: string;
  qrDataUrl: string;
  /** Defaults to "class" (YCC Co-Partner) — the original design this
   * certificate was built for. Pass "campus" for a YCC Partner instead. */
  partnerType?: "campus" | "class";
}

function ClassPartnerCertificateDocument({
  data,
}: {
  data: ClassPartnerCertificateData;
}) {
  const isCampus = data.partnerType === "campus";
  const roleLabel = isCampus ? "YCC Partner" : "YCC Co-Partner";
  const codeLabel = isCampus ? "Your Partner Code" : "Your Team Code";
  const stubRole = isCampus ? "PARTNER" : "CO-PARTNER";

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <CertificateArt />

        <Text style={styles.greeting}>Dear {roleLabel}</Text>
        <Text style={styles.name}>{data.name}</Text>

        <Text style={styles.body}>
          You are warmly invited to serve as a {roleLabel} for our
          Exclusive YCC Cricket League — Box Cricket Tournament. Your
          leadership and your {isCampus ? "co-partners'" : "classmates'"}{" "}
          participation will make this tournament even more special.
        </Text>

        <Text style={styles.codeLabel}>{codeLabel}</Text>
        <Text style={styles.codeValue}>{data.teamCode}</Text>

        <Text style={styles.stubYcc}>YCC</Text>
        <Text style={styles.stubYccSub}>CRICKET LEAGUE</Text>
        <Text style={styles.stubExclusive}>EXCLUSIVE</Text>
        <Text style={styles.stubPass1}>{stubRole}</Text>
        <Text style={styles.stubPass2}>PASS</Text>

        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={data.qrDataUrl} style={styles.qr} />
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
