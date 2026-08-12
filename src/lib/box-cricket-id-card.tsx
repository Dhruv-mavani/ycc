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
// pixel-identical to assets/boxcricket_idcard.svg. Only the truly dynamic
// parts (college/city, player name, the unique ID, the real QR) are drawn
// on top, each preceded by a solid rect sized to its own text/art zone
// that repaints over the original's placeholder content.
const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/brand/box-cricket-id-card-bg.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Native canvas size of assets/boxcricket_idcard.svg — the background PNG
// was rendered at exactly 2x this, so it stays crisp at native size.
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 1244;

const NAVY_BANNER = "#02165F";
const CITY_BLUE = "#3E9BFF";
const PAGE_BG = "#FCFCFC";
const NAVY_TEXT = "#051754";
const BLUE_BANNER = "#0547BB";
const BANNER_TEXT_WHITE = "#ffffff";

// QR frame — measured off the background PNG (native coords). The overlay
// clears the sample QR inside the original's own frame border (kept as
// part of the background) and drops the real one in at the same spot.
const QR_CLEAR_X = 262;
const QR_CLEAR_Y = 954;
const QR_CLEAR_W = 322;
const QR_CLEAR_H = 282;
const QR_SIZE = 250;
const QR_X = QR_CLEAR_X + (QR_CLEAR_W - QR_SIZE) / 2;
const QR_Y = QR_CLEAR_Y + (QR_CLEAR_H - QR_SIZE) / 2;

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: { position: "absolute", top: 0, left: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT },
  // Widths below stay inside the banner's own flat-color zone (measured
  // off the background PNG) — the brush-stroke texture starts past that
  // on both sides, so a plain rect here doesn't clip the torn edges.
  collegeClear: {
    position: "absolute",
    top: 373,
    left: 140,
    width: 600,
    height: 92,
    backgroundColor: NAVY_BANNER,
  },
  collegeName: {
    position: "absolute",
    top: 383,
    left: 140,
    width: 600,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: BANNER_TEXT_WHITE,
  },
  city: {
    position: "absolute",
    top: 438,
    left: 140,
    width: 600,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 21,
    letterSpacing: 1,
    color: CITY_BLUE,
  },
  // Tall enough to hold a name that wraps to 2 lines at the smallest
  // tier below, without reaching the college banner above (ends ~465)
  // or the divider below (starts ~665).
  nameClear: {
    position: "absolute",
    top: 485,
    left: 20,
    width: 810,
    height: 175,
    backgroundColor: PAGE_BG,
  },
  playerName: {
    position: "absolute",
    left: 30,
    width: 782,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: NAVY_TEXT,
  },
  uniqueIdClear: {
    position: "absolute",
    top: 862,
    left: 283,
    width: 312,
    height: 72,
    backgroundColor: BLUE_BANNER,
  },
  uniqueIdBannerText: {
    position: "absolute",
    top: 880,
    left: 283,
    width: 312,
    textAlign: "center",
    fontFamily: "Helvetica-BoldOblique",
    fontSize: 24,
    letterSpacing: 1,
    color: BANNER_TEXT_WHITE,
  },
  qrClear: {
    position: "absolute",
    top: QR_CLEAR_Y,
    left: QR_CLEAR_X,
    width: QR_CLEAR_W,
    height: QR_CLEAR_H,
    borderRadius: 18,
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

// Long names wrap to 2+ lines at a fixed font size and spill into the
// divider/college banner — scale down and shift up as length grows so
// even a long full name stays inside its clear zone.
function playerNameStyle(name: string) {
  if (name.length <= 16) return { fontSize: 62, top: 553 };
  if (name.length <= 24) return { fontSize: 46, top: 535 };
  return { fontSize: 36, top: 515 };
}

function collegeNameFontSize(name: string) {
  return name.length <= 30 ? 32 : 24;
}

export interface BoxCricketIdCardData {
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
export function BoxCricketIdCardPage({ data }: { data: BoxCricketIdCardData }) {
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

      <View style={styles.uniqueIdClear} />
      <Text style={styles.uniqueIdBannerText}>{data.uniqueId}</Text>

      <View style={styles.qrClear} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={data.qrDataUrl} style={styles.qr} />
    </Page>
  );
}

export async function renderBoxCricketIdCardPdf(
  data: BoxCricketIdCardData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <BoxCricketIdCardPage data={data} />
    </Document>,
  );
}
