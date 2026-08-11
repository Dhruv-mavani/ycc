import "server-only";
import {
  Document,
  Page,
  Text,
  Image,
  StyleSheet,
  Svg,
  Path,
  Rect,
  renderToBuffer,
} from "@react-pdf/renderer";
import { QUIZ_ID_CARD_PATHS, QUIZ_ID_CARD_SIZE } from "@/lib/quiz-id-card-art";

// Every position below was measured directly off a clean render of the
// source template (assets/quiz_idcard.svg) via a pixel-scanning script —
// not eyeballed. The page matches that source's native canvas exactly, so
// QUIZ_ID_CARD_PATHS needs no rescale.
const PAGE_WIDTH = QUIZ_ID_CARD_SIZE.width;
const PAGE_HEIGHT = QUIZ_ID_CARD_SIZE.height;

const GOLD = "#EAA803";
const BLACK_TEXT = "#0a0a0a";
const QR_FRAME_GOLD = "#FDB000";

// react-pdf (4.5.1) hangs indefinitely if an absolutely-positioned Image
// overflows past the bottom of the Page while a sibling Svg is present —
// so this frame/QR must stay fully inside PAGE_HEIGHT (1567).
const QR_FRAME_X = 270;
const QR_FRAME_Y = 1120;
const QR_FRAME_SIZE = 380;
const QR_PADDING = 20;

const styles = StyleSheet.create({
  page: { position: "relative", fontFamily: "Helvetica", backgroundColor: "#FCFCFC" },
  collegeName: {
    position: "absolute",
    top: 558,
    left: 60,
    width: 884,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    color: "#ffffff",
  },
  city: {
    position: "absolute",
    top: 628,
    left: 60,
    width: 884,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    letterSpacing: 1,
    color: GOLD,
  },
  playerName: {
    position: "absolute",
    top: 748,
    left: 30,
    width: 944,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 78,
    color: BLACK_TEXT,
  },
  organizedLine1: {
    position: "absolute",
    top: 932,
    left: 100,
    width: 804,
    textAlign: "center",
    fontFamily: "Times-Bold",
    fontSize: 20,
    letterSpacing: 0.5,
    color: BLACK_TEXT,
  },
  organizedLine2: {
    position: "absolute",
    top: 987,
    left: 100,
    width: 804,
    textAlign: "center",
    fontFamily: "Times-Bold",
    fontSize: 26,
    color: BLACK_TEXT,
  },
  uniqueId: {
    position: "absolute",
    top: 1092,
    left: 60,
    width: 884,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: 2,
    color: GOLD,
  },
  mandatoryLine1: {
    position: "absolute",
    top: 1221,
    left: 695,
    width: 260,
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: BLACK_TEXT,
  },
  mandatoryLine2: {
    position: "absolute",
    top: 1247,
    left: 695,
    width: 260,
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: GOLD,
  },
  mandatoryLine3: {
    position: "absolute",
    top: 1281,
    left: 695,
    width: 260,
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: BLACK_TEXT,
  },
  mandatoryLine4: {
    position: "absolute",
    top: 1319,
    left: 695,
    width: 260,
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: BLACK_TEXT,
  },
  qr: {
    position: "absolute",
    top: QR_FRAME_Y + QR_PADDING,
    left: QR_FRAME_X + QR_PADDING,
    width: QR_FRAME_SIZE - QR_PADDING * 2,
    height: QR_FRAME_SIZE - QR_PADDING * 2,
  },
});

function QuizArt() {
  return (
    <Svg width={PAGE_WIDTH} height={PAGE_HEIGHT}>
      {QUIZ_ID_CARD_PATHS.map((p, i) => (
        <Path key={i} d={p.d} fill={p.fill} />
      ))}
      <Rect
        x={QR_FRAME_X}
        y={QR_FRAME_Y}
        width={QR_FRAME_SIZE}
        height={QR_FRAME_SIZE}
        rx={20}
        fill="#ffffff"
        stroke={QR_FRAME_GOLD}
        strokeWidth={4}
      />
    </Svg>
  );
}

export interface QuizIdCardData {
  playerName: string;
  collegeName: string;
  city: string | null;
  uniqueId: string;
  qrDataUrl: string;
}

function QuizIdCardDocument({ data }: { data: QuizIdCardData }) {
  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <QuizArt />

        <Text style={styles.collegeName}>{data.collegeName.toUpperCase()}</Text>
        {data.city ? (
          <Text style={styles.city}>{data.city.toUpperCase()}</Text>
        ) : null}

        <Text style={styles.playerName}>{data.playerName.toUpperCase()}</Text>

        <Text style={styles.organizedLine1}>ORGANIZED &amp; MANAGED BY</Text>
        <Text style={styles.organizedLine2}>YCC CRICKET</Text>

        <Text style={styles.uniqueId}>{data.uniqueId}</Text>

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

export async function renderQuizIdCardPdf(data: QuizIdCardData): Promise<Buffer> {
  return renderToBuffer(<QuizIdCardDocument data={data} />);
}
