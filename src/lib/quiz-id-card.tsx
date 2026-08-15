import "server-only";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";

// Same approach as box-cricket-id-card.tsx: the whole design is the
// original asset (assets/quiz_idcard.svg), rendered once to a high-res
// PNG and used as a full-page background — pixel-identical to the
// source. Only the dynamic parts (college/city, player name, unique ID,
// real QR) are drawn on top, each preceded by a solid rect that repaints
// over the original's placeholder content in that zone.
const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/brand/quiz-id-card-bg.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Native canvas size of assets/quiz_idcard.svg — the background PNG was
// rendered at exactly 2x this, so it stays crisp at native size. Every
// coordinate below was measured against this native canvas.
const ART_WIDTH = 1004;
const ART_HEIGHT = 1567;

// Page matches the receipt/invitation-letter A4 size, rather than the
// card art's own native portrait ratio (which is taller/narrower than A4)
// — the art is scaled to fit fully inside the page (letterboxed on the
// sides here since it's height-constrained) instead of being a
// differently-sized outlier page in the combined PDF.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
// A background sized to exactly match the page's height triggers a
// react-pdf/yoga layout edge case where the absolutely-positioned overlay
// siblings (name, QR, etc.) get pushed onto a spurious second page instead
// of staying on top of the background. Scaling to fit just *inside* the
// page (rather than flush with it) keeps the art comfortably clear of
// that boundary.
const FIT_MARGIN = 0.98;
const SCALE =
  Math.min(PAGE_WIDTH / ART_WIDTH, PAGE_HEIGHT / ART_HEIGHT) * FIT_MARGIN;
const ART_LEFT = (PAGE_WIDTH - ART_WIDTH * SCALE) / 2;
const ART_TOP = (PAGE_HEIGHT - ART_HEIGHT * SCALE) / 2;
const s = (value: number) => value * SCALE;

const BLACK_BANNER = "#030303";
const GOLD = "#EAA803";
const PAGE_BG = "#FCFCFC";
const BLACK_TEXT = "#0a0a0a";

// QR frame — measured off the background PNG (native coords).
const QR_CLEAR_X = 274;
const QR_CLEAR_Y = 1125;
const QR_CLEAR_W = 370;
const QR_CLEAR_H = 386;
const QR_SIZE = 335;
const QR_X = QR_CLEAR_X + (QR_CLEAR_W - QR_SIZE) / 2;
const QR_Y = QR_CLEAR_Y + (QR_CLEAR_H - QR_SIZE) / 2;

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: ART_TOP,
    left: ART_LEFT,
    width: s(ART_WIDTH),
    height: s(ART_HEIGHT),
  },
  collegeClear: {
    position: "absolute",
    top: ART_TOP + s(548),
    left: ART_LEFT + s(255),
    width: s(655),
    height: s(118),
    backgroundColor: BLACK_BANNER,
  },
  collegeName: {
    position: "absolute",
    top: ART_TOP + s(558),
    left: ART_LEFT + s(255),
    width: s(655),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  city: {
    position: "absolute",
    top: ART_TOP + s(628),
    left: ART_LEFT + s(255),
    width: s(655),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(22),
    letterSpacing: s(1),
    color: GOLD,
  },
  // Tall enough for a 2-line name at the smallest tier below, without
  // reaching the college banner above (ends ~666) or the organized-by
  // text below (starts ~934).
  nameClear: {
    position: "absolute",
    top: ART_TOP + s(700),
    left: ART_LEFT + s(60),
    width: s(884),
    height: s(205),
    backgroundColor: PAGE_BG,
  },
  playerName: {
    position: "absolute",
    left: ART_LEFT + s(30),
    width: s(944),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: BLACK_TEXT,
  },
  uniqueId: {
    position: "absolute",
    top: ART_TOP + s(1093),
    left: ART_LEFT + s(60),
    width: s(884),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(22),
    letterSpacing: s(2),
    color: GOLD,
  },
  qrClear: {
    position: "absolute",
    top: ART_TOP + s(QR_CLEAR_Y),
    left: ART_LEFT + s(QR_CLEAR_X),
    width: s(QR_CLEAR_W),
    height: s(QR_CLEAR_H),
    borderRadius: s(20),
    backgroundColor: "#ffffff",
  },
  qr: {
    position: "absolute",
    top: ART_TOP + s(QR_Y),
    left: ART_LEFT + s(QR_X),
    width: s(QR_SIZE),
    height: s(QR_SIZE),
  },
});

// Long names wrap to 2+ lines at a fixed font size and spill into
// neighboring zones — scale down and shift up as length grows.
function playerNameStyle(name: string) {
  if (name.length <= 16) return { fontSize: s(72), top: ART_TOP + s(750) };
  if (name.length <= 24) return { fontSize: s(54), top: ART_TOP + s(735) };
  return { fontSize: s(42), top: ART_TOP + s(715) };
}

function collegeNameFontSize(name: string) {
  return s(name.length <= 26 ? 40 : name.length <= 34 ? 32 : 26);
}

export interface QuizIdCardData {
  playerName: string;
  collegeName: string;
  city: string | null;
  uniqueId: string;
  qrDataUrl: string;
}

// Exported (not just the Document wrapper below) so the combined
// receipt+ID-cards PDF (src/lib/receipts.tsx) can drop this page in
// directly alongside other pages in one Document — react-pdf documents
// can't be nested, only their Page children can be composed.
export function QuizIdCardPage({ data }: { data: QuizIdCardData }) {
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      <View style={styles.collegeClear} />
      <Text
        style={[
          styles.collegeName,
          { fontSize: collegeNameFontSize(data.collegeName) },
        ]}
      >
        {data.collegeName.toUpperCase()}
      </Text>
      {data.city ? (
        <Text style={styles.city}>{data.city.toUpperCase()}</Text>
      ) : null}

      <View style={styles.nameClear} />
      <Text style={[styles.playerName, playerNameStyle(data.playerName)]}>
        {data.playerName.toUpperCase()}
      </Text>

      <Text style={styles.uniqueId}>{data.uniqueId}</Text>

      <View style={styles.qrClear} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={data.qrDataUrl} style={styles.qr} />
    </Page>
  );
}

export async function renderQuizIdCardPdf(data: QuizIdCardData): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <QuizIdCardPage data={data} />
    </Document>,
  );
}
