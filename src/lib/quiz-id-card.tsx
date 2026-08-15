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

// The whole card (logo, tagline, banners, icons, QR frame, mandatory-QR
// text, corner art) is the original design's own asset, rendered once at
// build time to a high-res PNG and used as a full-page background —
// pixel-identical to public/clean_ID_cards/quiz_ycc_team_name_id_card.svg
// (a cleaner redesign supplied to replace the original template). Only
// the truly dynamic parts (college/city, player name, the unique ID, the
// real QR) are drawn on top, each preceded by a solid rect that repaints
// over the original's placeholder content in that zone — coordinates
// re-measured against the new art (not reused from the old template).
const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/brand/quiz-id-card-bg.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Native canvas size of the new SVG source. Every coordinate below was
// measured against this native canvas.
const ART_WIDTH = 1023;
const ART_HEIGHT = 1537;

// Page matches the receipt/invitation-letter A4 size, rather than the
// card art's own native portrait ratio — the art is scaled to fit fully
// inside the page (letterboxed on the sides here since it's
// height-constrained) instead of being a differently-sized outlier page
// in the combined PDF.
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

const BLACK_BANNER = "#000000";
const BLACK_TEXT = "#0a0a0a";
const GOLD = "#ffaa00";
const PAGE_BG = "#fdfdfd";

// QR frame — measured off the new background PNG (native coords), inset
// from the frame's own border so the real QR sits centered inside it
// instead of crowding/overlapping the border.
const QR_X = 325;
const QR_Y = 1178;
const QR_SIZE = 320;

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: ART_TOP,
    left: ART_LEFT,
    width: s(ART_WIDTH),
    height: s(ART_HEIGHT),
  },
  // Tight to the banner's own uniform-fill core (measured via a
  // row-variance scan of the background PNG — anything looser lands in
  // the frayed brush-stroke edge and leaves a visible hard-edged rect
  // sitting on top of the soft texture).
  collegeClear: {
    position: "absolute",
    top: ART_TOP + s(602),
    left: ART_LEFT + s(40),
    width: s(944),
    height: s(120),
    backgroundColor: BLACK_BANNER,
  },
  collegeName: {
    position: "absolute",
    top: ART_TOP + s(612),
    left: ART_LEFT + s(40),
    width: s(944),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  city: {
    position: "absolute",
    top: ART_TOP + s(680),
    left: ART_LEFT + s(40),
    width: s(944),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(20),
    letterSpacing: s(1),
    color: GOLD,
  },
  nameClear: {
    position: "absolute",
    top: ART_TOP + s(790),
    left: ART_LEFT + s(40),
    width: s(944),
    height: s(130),
    backgroundColor: PAGE_BG,
  },
  playerName: {
    position: "absolute",
    left: ART_LEFT + s(40),
    width: s(944),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: BLACK_TEXT,
  },
  uniqueIdClear: {
    position: "absolute",
    top: ART_TOP + s(1122),
    left: ART_LEFT + s(390),
    width: s(244),
    height: s(38),
    backgroundColor: PAGE_BG,
  },
  uniqueId: {
    position: "absolute",
    top: ART_TOP + s(1128),
    left: ART_LEFT + s(40),
    width: s(944),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(22),
    letterSpacing: s(2),
    color: GOLD,
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
  if (name.length <= 16) return { fontSize: s(66), top: ART_TOP + s(815) };
  if (name.length <= 24) return { fontSize: s(50), top: ART_TOP + s(798) };
  return { fontSize: s(40), top: ART_TOP + s(782) };
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

      <View style={styles.uniqueIdClear} />
      <Text style={styles.uniqueId}>{data.uniqueId}</Text>

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
