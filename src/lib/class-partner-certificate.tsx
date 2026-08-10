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
  G,
  Rect,
  Circle,
  Line,
  Path,
  Polygon,
  renderToBuffer,
} from "@react-pdf/renderer";
import path from "node:path";

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
    top: 246,
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
    top: 372,
    left: 460,
    width: 770,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 12,
    color: GRAY_TEXT,
  },
  codeValue: {
    position: "absolute",
    top: 392,
    left: 460,
    width: 770,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    letterSpacing: 2,
    color: TEXT_DARK,
  },
  wordmark: {
    position: "absolute",
    top: 44,
    left: 142,
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    letterSpacing: 1,
    color: BLUE,
  },
  wordmarkSub: {
    position: "absolute",
    top: 100,
    left: 142,
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    letterSpacing: 2.5,
    color: BLUE_DEEP,
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
        <LinearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4f8cf0" />
          <Stop offset="100%" stopColor={BLUE_DEEP} />
        </LinearGradient>
        <LinearGradient id="waveGradBack" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={BLUE_DEEP} />
          <Stop offset="100%" stopColor={BLUE} />
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

      {/* Decorative artwork. Coordinates are chosen to stay clear of the
          card's rounded corners rather than relying on an SVG clipPath —
          react-pdf's clipPath (when the clip rect's origin isn't (0,0))
          corrupts the rotate-transform math on descendants, which silently
          collapses any rotated child (e.g. the batsman's bat) to a stub. */}
      <G>
        {/* Bottom-left wave ribbon */}
        <Path
          d={`M${CARD_X + CARD_RX},520
              C ${CARD_X + 120},470 ${CARD_X + 220},560 ${CARD_X + 340},540
              C ${CARD_X + 460},520 ${CARD_X + 520},600 ${CARD_X + 660},640
              C ${CARD_X + 780},672 ${CARD_X + 900},668 ${SEAM_X},700
              L ${SEAM_X},${CARD_Y + CARD_H}
              L ${CARD_X + CARD_RX},${CARD_Y + CARD_H} Z`}
          fill="url(#waveGradBack)"
          opacity={0.9}
        />
        <Path
          d={`M${CARD_X + CARD_RX},560
              C ${CARD_X + 110},520 ${CARD_X + 210},600 ${CARD_X + 330},585
              C ${CARD_X + 450},570 ${CARD_X + 500},630 ${CARD_X + 620},665
              C ${CARD_X + 720},694 ${CARD_X + 820},690 ${CARD_X + 940},715
              L ${CARD_X + 940},${CARD_Y + CARD_H}
              L ${CARD_X + CARD_RX},${CARD_Y + CARD_H} Z`}
          fill={BLUE}
          opacity={0.55}
        />
        <Path
          d={`M${CARD_X + CARD_RX},520
              C ${CARD_X + 120},470 ${CARD_X + 220},560 ${CARD_X + 340},540
              C ${CARD_X + 460},520 ${CARD_X + 520},600 ${CARD_X + 660},640
              C ${CARD_X + 780},672 ${CARD_X + 900},668 ${SEAM_X},700`}
          fill="none"
          stroke="#bfdbfe"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Floodlights */}
        <G opacity={0.65}>
          <Rect x={77} y={355} width={6} height={285} fill={BLUE_DEEP} />
          <Rect x={159} y={322} width={6} height={318} fill={BLUE_DEEP} />
          {[-26, -13, 0, 13, 26].map((dx) => (
            <Line
              key={`fl1-${dx}`}
              x1={80}
              y1={355}
              x2={80 + dx}
              y2={323}
              stroke={BLUE_DEEP}
              strokeWidth={3}
            />
          ))}
          {[-26, -13, 0, 13, 26].map((dx) => (
            <Line
              key={`fl2-${dx}`}
              x1={162}
              y1={322}
              x2={162 + dx}
              y2={290}
              stroke={BLUE_DEEP}
              strokeWidth={3}
            />
          ))}
        </G>

        {/* Batsman silhouette, bat raised — built from rotated stick
            shapes (each rect pivots around its joint) rather than
            freehand polygons, so the pose stays legible at small size.
            react-pdf's rotate() is clockwise, so a positive angle on a
            rect drawn pointing down (+y) swings its free end left, and a
            negative angle swings it right. */}
        <G transform="translate(60,340)">
          <G fill={BLUE_DEEP} opacity={0.85}>
            <Circle cx={148} cy={20} r={15} />
            <Rect x={-15} y={0} width={30} height={80} rx={13} transform="translate(148,35) rotate(-6)" />
            <Rect x={-9} y={0} width={18} height={92} rx={9} transform="translate(140,111) rotate(16)" />
            <Rect x={-9} y={0} width={18} height={100} rx={9} transform="translate(157,111) rotate(-24)" />
            <Rect x={-8} y={0} width={16} height={64} rx={8} transform="translate(163,42) rotate(208)" />
          </G>
          <Rect
            x={-7.5}
            y={0}
            width={15}
            height={130}
            rx={6}
            fill={GOLD}
            opacity={0.9}
            transform="translate(163,42) rotate(196)"
          />
          <Circle cx={163} cy={42} r={7.5} fill={BLUE_DEEP} opacity={0.85} />
        </G>

        {/* Cricket ball with motion lines */}
        <Line x1={330} y1={330} x2={366} y2={318} stroke={BLUE_DEEP} strokeWidth={3} opacity={0.5} />
        <Line x1={334} y1={344} x2={372} y2={336} stroke={BLUE_DEEP} strokeWidth={3} opacity={0.5} />
        <Line x1={330} y1={358} x2={366} y2={354} stroke={BLUE_DEEP} strokeWidth={3} opacity={0.5} />
        <Circle cx={392} cy={338} r={11} fill={NAVY_DARK} />
        <Path
          d="M383,331 C388,336 388,341 383,346"
          fill="none"
          stroke={WHITE}
          strokeWidth={1.5}
        />
        <Path
          d="M401,331 C396,336 396,341 401,346"
          fill="none"
          stroke={WHITE}
          strokeWidth={1.5}
        />
      </G>

      {/* Trophy */}
      <G transform="translate(64,50)">
        <Path
          d="M6,0 L56,0 C56,24 46,36 31,36 C16,36 6,24 6,0 Z"
          fill="url(#trophyGrad)"
        />
        <Path
          d="M6,4 C-10,4 -10,28 6,26"
          fill="none"
          stroke={BLUE}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M56,4 C72,4 72,28 56,26"
          fill="none"
          stroke={BLUE}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Rect x={26} y={36} width={9} height={17} fill={BLUE_DEEP} />
        <Rect x={10} y={53} width={41} height={7} rx={2} fill={BLUE_DEEP} />
        <Rect x={4} y={60} width={53} height={9} rx={2} fill={BLUE} />
        <Line x1={16} y1={12} x2={46} y2={26} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
        <Line x1={46} y1={12} x2={16} y2={26} stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
        <Circle cx={31} cy={19} r={2.6} fill={GOLD_BRIGHT} />
      </G>

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

        <Text style={styles.wordmark}>YCC</Text>
        <Text style={styles.wordmarkSub}>YUVA CHAMPIONS CRICKET</Text>

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
