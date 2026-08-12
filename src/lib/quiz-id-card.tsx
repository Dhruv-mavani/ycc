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
// rendered at exactly 2x this, so it stays crisp at native size.
const PAGE_WIDTH = 1004;
const PAGE_HEIGHT = 1567;

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
  background: { position: "absolute", top: 0, left: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT },
  collegeClear: {
    position: "absolute",
    top: 548,
    left: 255,
    width: 655,
    height: 118,
    backgroundColor: BLACK_BANNER,
  },
  collegeName: {
    position: "absolute",
    top: 558,
    left: 255,
    width: 655,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  city: {
    position: "absolute",
    top: 628,
    left: 255,
    width: 655,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: 1,
    color: GOLD,
  },
  // Tall enough for a 2-line name at the smallest tier below, without
  // reaching the college banner above (ends ~666) or the organized-by
  // text below (starts ~934).
  nameClear: {
    position: "absolute",
    top: 700,
    left: 60,
    width: 884,
    height: 205,
    backgroundColor: PAGE_BG,
  },
  playerName: {
    position: "absolute",
    left: 30,
    width: 944,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: BLACK_TEXT,
  },
  uniqueId: {
    position: "absolute",
    top: 1093,
    left: 60,
    width: 884,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: 2,
    color: GOLD,
  },
  qrClear: {
    position: "absolute",
    top: QR_CLEAR_Y,
    left: QR_CLEAR_X,
    width: QR_CLEAR_W,
    height: QR_CLEAR_H,
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  qr: {
    position: "absolute",
    top: QR_Y,
    left: QR_X,
    width: QR_SIZE,
    height: QR_SIZE,
  },
});

// Long names wrap to 2+ lines at a fixed font size and spill into
// neighboring zones — scale down and shift up as length grows.
function playerNameStyle(name: string) {
  if (name.length <= 16) return { fontSize: 72, top: 750 };
  if (name.length <= 24) return { fontSize: 54, top: 735 };
  return { fontSize: 42, top: 715 };
}

function collegeNameFontSize(name: string) {
  return name.length <= 26 ? 40 : name.length <= 34 ? 32 : 26;
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
    <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
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
