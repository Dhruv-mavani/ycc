import "server-only";
import {
  Document,
  Page,
  Text,
  Image,
  StyleSheet,
  Svg,
  G,
  Path,
  Rect,
  Polygon,
  renderToBuffer,
} from "@react-pdf/renderer";
import { TROPHY_LOGO_PATHS, TROPHY_LOGO_SIZE } from "@/lib/trophy-logo-art";
import {
  BOX_CRICKET_ID_CARD_PATHS,
  BOX_CRICKET_ID_CARD_SIZE,
} from "@/lib/box-cricket-id-card-art";

// Every position below was measured directly off a clean render of the
// source template (assets/boxcricket_idcard.svg) via a pixel-scanning
// script — not eyeballed. The page matches that source's native canvas
// exactly, so BOX_CRICKET_ID_CARD_PATHS needs no rescale.
const PAGE_WIDTH = BOX_CRICKET_ID_CARD_SIZE.width;
const PAGE_HEIGHT = BOX_CRICKET_ID_CARD_SIZE.height;

const YCC_BLUE = "#0569D6";
const SUBTITLE_BLUE = "#2f5fb3";
const TAGLINE_BLUE = "#0F389F";
const NAVY_TEXT = "#051754";
const ORG_BLUE = "#084DCA";
const BANNER_TEXT_WHITE = "#ffffff";
const MANDATORY_BLACK = "#141A55";
const MANDATORY_BLUE = "#1D51CB";
const QR_FRAME_BLUE = "#1d4ed8";

// Trophy icon (assets/classpartner_certificate3.svg, isolated to just the
// cup) placed to match the faded original's logo position/size — the
// wordmark next to it is retyped below instead of reused from the trace.
const TROPHY_X = 130;
const TROPHY_Y = 15;
const TROPHY_SCALE = 204 / TROPHY_LOGO_SIZE.height;

// react-pdf (4.5.1) hangs indefinitely if an absolutely-positioned Image
// overflows past the bottom of the Page while a sibling Svg is present —
// so this frame/QR must stay fully inside PAGE_HEIGHT (1244).
const QR_FRAME_X = 246;
const QR_FRAME_Y = 924;
const QR_FRAME_SIZE = 300;
const QR_PADDING = 18;

// 5-point star polygon (point-up), used for the star row below the name
// divider — that zone's exclusion swept up these too (same trace region
// as the "ORGANIZED & MANAGED BY" text), so they're hand-drawn instead.
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
const STAR_CENTERS = [247, 339, 431, 523, 614];

const styles = StyleSheet.create({
  page: { position: "relative", fontFamily: "Helvetica", backgroundColor: "#FCFCFC" },
  ycc: {
    position: "absolute",
    top: 8,
    left: 335,
    width: 400,
    fontFamily: "Helvetica-Bold",
    fontSize: 128,
    color: YCC_BLUE,
  },
  subtitle: {
    position: "absolute",
    top: 190,
    left: 341,
    width: 389,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    letterSpacing: 1.2,
    color: SUBTITLE_BLUE,
  },
  tagline: {
    position: "absolute",
    top: 250,
    left: 60,
    width: 722,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: TAGLINE_BLUE,
  },
  collegeName: {
    position: "absolute",
    top: 385,
    left: 190,
    width: 610,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 34,
    color: BANNER_TEXT_WHITE,
  },
  city: {
    position: "absolute",
    top: 442,
    left: 190,
    width: 610,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: 1,
    color: "#7fb2ff",
  },
  playerName: {
    position: "absolute",
    top: 553,
    left: 30,
    width: 782,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 68,
    color: NAVY_TEXT,
  },
  organizedLine1: {
    position: "absolute",
    top: 699,
    left: 121,
    width: 600,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    letterSpacing: 1,
    color: NAVY_TEXT,
  },
  organizedLine2: {
    position: "absolute",
    top: 715,
    left: 121,
    width: 600,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: ORG_BLUE,
  },
  boxCricketBannerText: {
    position: "absolute",
    top: 818,
    left: 233,
    width: 413,
    textAlign: "center",
    fontFamily: "Helvetica-BoldOblique",
    fontSize: 22,
    letterSpacing: 1,
    color: BANNER_TEXT_WHITE,
  },
  uniqueIdBannerText: {
    position: "absolute",
    top: 880,
    left: 235,
    width: 395,
    textAlign: "center",
    fontFamily: "Helvetica-BoldOblique",
    fontSize: 26,
    letterSpacing: 2,
    color: BANNER_TEXT_WHITE,
  },
  courtLabel: {
    position: "absolute",
    top: 1032,
    left: 12,
    width: 178,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    letterSpacing: 0.5,
    color: BANNER_TEXT_WHITE,
  },
  mandatoryLine1: {
    position: "absolute",
    top: 990,
    left: 627,
    width: 180,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: MANDATORY_BLACK,
  },
  mandatoryLine2: {
    position: "absolute",
    top: 1018,
    left: 627,
    width: 180,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: MANDATORY_BLUE,
  },
  mandatoryLine3: {
    position: "absolute",
    top: 1041,
    left: 627,
    width: 180,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: MANDATORY_BLACK,
  },
  mandatoryLine4: {
    position: "absolute",
    top: 1064,
    left: 627,
    width: 180,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: MANDATORY_BLACK,
  },
  qr: {
    position: "absolute",
    top: QR_FRAME_Y + QR_PADDING,
    left: QR_FRAME_X + QR_PADDING,
    width: QR_FRAME_SIZE - QR_PADDING * 2,
    height: QR_FRAME_SIZE - QR_PADDING * 2,
  },
});

function BoxCricketArt() {
  return (
    <Svg width={PAGE_WIDTH} height={PAGE_HEIGHT}>
      {BOX_CRICKET_ID_CARD_PATHS.map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}
      <G transform={`translate(${TROPHY_X}, ${TROPHY_Y}) scale(${TROPHY_SCALE})`}>
        {TROPHY_LOGO_PATHS.map((p, i) => (
          <Path key={i} d={p.d} fill={p.fill} />
        ))}
      </G>
      <Rect
        x={QR_FRAME_X}
        y={QR_FRAME_Y}
        width={QR_FRAME_SIZE}
        height={QR_FRAME_SIZE}
        rx={18}
        fill="#ffffff"
        stroke={QR_FRAME_BLUE}
        strokeWidth={3}
      />
      {STAR_CENTERS.map((cx, i) => (
        <Polygon
          key={cx}
          points={starPoints(cx, 774, i === 2 ? 17 : 10)}
          fill={i === 2 ? QR_FRAME_BLUE : NAVY_TEXT}
        />
      ))}
      <Rect x={10} y={1030} width={180} height={38} rx={7} fill={ORG_BLUE} />
    </Svg>
  );
}

export interface BoxCricketIdCardData {
  playerName: string;
  collegeName: string;
  city: string | null;
  uniqueId: string;
  qrDataUrl: string;
}

function BoxCricketIdCardDocument({ data }: { data: BoxCricketIdCardData }) {
  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <BoxCricketArt />

        <Text style={styles.ycc}>YCC</Text>
        <Text style={styles.subtitle}>YUVA CHAMPIONS CRICKET</Text>
        <Text style={styles.tagline}>Cricket. Communities. Champions.</Text>

        <Text style={styles.collegeName}>{data.collegeName.toUpperCase()}</Text>
        {data.city ? (
          <Text style={styles.city}>{data.city.toUpperCase()}</Text>
        ) : null}

        <Text style={styles.playerName}>{data.playerName.toUpperCase()}</Text>

        <Text style={styles.organizedLine1}>ORGANIZED &amp; MANAGED BY</Text>
        <Text style={styles.organizedLine2}>YCC CRICKET</Text>

        <Text style={styles.boxCricketBannerText}>BOX CRICKET</Text>
        <Text style={styles.uniqueIdBannerText}>{data.uniqueId}</Text>

        <Text style={styles.courtLabel}>BOX CRICKET</Text>

        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={data.qrDataUrl} style={styles.qr} />

        <Text style={styles.mandatoryLine1}>This QR is</Text>
        <Text style={styles.mandatoryLine2}>mandatory</Text>
        <Text style={styles.mandatoryLine3}>to bring</Text>
        <Text style={styles.mandatoryLine4}>at the venue.</Text>
      </Page>
    </Document>
  );
}

export async function renderBoxCricketIdCardPdf(
  data: BoxCricketIdCardData,
): Promise<Buffer> {
  return renderToBuffer(<BoxCricketIdCardDocument data={data} />);
}
