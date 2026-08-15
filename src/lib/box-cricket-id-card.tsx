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
// pixel-identical to public/clean_ID_cards/box_cricket_ycc_team_name_id_card.svg
// (a cleaner redesign supplied to replace the original template). Only
// the truly dynamic parts (college/city, player name, the unique ID, the
// real QR) are drawn on top, each preceded by a solid rect sized to its
// own text/art zone that repaints over the original's placeholder
// content — same "clear-and-redraw" approach as before, coordinates
// re-measured against the new art (not reused from the old template).
const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/brand/box-cricket-id-card-bg.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Native canvas size of the new SVG source. Every coordinate below was
// measured against this native canvas.
const ART_WIDTH = 1024;
const ART_HEIGHT = 1536;

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

const NAVY_BANNER = "#001c6b";
const NAVY_TEXT = "#011b69";
const ID_BANNER_BLUE = "#003bc1";
const PAGE_BG = "#fafafa";
const BANNER_TEXT_WHITE = "#ffffff";

// QR frame — measured off the new background PNG (native coords), inset
// from the frame's own border so the real QR sits centered inside it
// instead of crowding/overlapping the border.
const QR_X = 325;
const QR_Y = 1160;
const QR_SIZE = 300;

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
    top: ART_TOP + s(474),
    left: ART_LEFT + s(90),
    width: s(840),
    height: s(88),
    backgroundColor: NAVY_BANNER,
  },
  collegeName: {
    position: "absolute",
    top: ART_TOP + s(482),
    left: ART_LEFT + s(90),
    width: s(840),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: BANNER_TEXT_WHITE,
  },
  city: {
    position: "absolute",
    top: ART_TOP + s(530),
    left: ART_LEFT + s(90),
    width: s(840),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(20),
    letterSpacing: s(1),
    color: BANNER_TEXT_WHITE,
  },
  nameClear: {
    position: "absolute",
    top: ART_TOP + s(650),
    left: ART_LEFT + s(40),
    width: s(944),
    height: s(140),
    backgroundColor: PAGE_BG,
  },
  playerName: {
    position: "absolute",
    left: ART_LEFT + s(40),
    width: s(944),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: NAVY_TEXT,
  },
  // "TEAM NAME" banner has two lines baked into the art: a label line and
  // a sample-code line below it. Both get cleared and replaced — the top
  // line with the real team name, the bottom with the unique ID — so
  // nothing reads "TEAM NAME" literally in the final card.
  teamNameClear: {
    position: "absolute",
    top: ART_TOP + s(1015),
    left: ART_LEFT + s(290),
    width: s(440),
    height: s(56),
    backgroundColor: ID_BANNER_BLUE,
  },
  teamNameText: {
    position: "absolute",
    top: ART_TOP + s(1024),
    left: ART_LEFT + s(290),
    width: s(440),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: BANNER_TEXT_WHITE,
  },
  uniqueIdClear: {
    position: "absolute",
    top: ART_TOP + s(1073),
    left: ART_LEFT + s(290),
    width: s(440),
    height: s(50),
    backgroundColor: ID_BANNER_BLUE,
  },
  uniqueIdBannerText: {
    position: "absolute",
    top: ART_TOP + s(1080),
    left: ART_LEFT + s(290),
    width: s(440),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(24),
    letterSpacing: s(1.5),
    color: BANNER_TEXT_WHITE,
  },
  // Small caption in the open space above the court icon — the icon has
  // no "BOX CRICKET" label baked into this redesign (unlike the QR's own
  // "mandatory" caption). The icon sits left of the "TEAM NAME" banner's
  // own column, so this has the whole left column clear above it.
  courtLabel: {
    position: "absolute",
    top: ART_TOP + s(1068),
    left: ART_LEFT + s(10),
    width: s(280),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(20),
    letterSpacing: s(1),
    color: NAVY_TEXT,
  },
  qr: {
    position: "absolute",
    top: ART_TOP + s(QR_Y),
    left: ART_LEFT + s(QR_X),
    width: s(QR_SIZE),
    height: s(QR_SIZE),
  },
});

// Long names wrap to 2+ lines at a fixed font size and spill into the
// divider/college banner — scale down and shift up as length grows so
// even a long full name stays inside its clear zone.
function playerNameStyle(name: string) {
  if (name.length <= 16) return { fontSize: s(64), top: ART_TOP + s(680) };
  if (name.length <= 24) return { fontSize: s(48), top: ART_TOP + s(660) };
  return { fontSize: s(38), top: ART_TOP + s(645) };
}

function collegeNameFontSize(name: string) {
  return s(name.length <= 30 ? 26 : 20);
}

function teamNameFontSize(name: string) {
  return s(name.length <= 14 ? 26 : name.length <= 22 ? 20 : 16);
}

export interface BoxCricketIdCardData {
  playerName: string;
  collegeName: string;
  city: string | null;
  uniqueId: string;
  qrDataUrl: string;
  teamName: string | null;
}

// Exported (not just the Document wrapper below) so the combined
// receipt+ID-cards PDF (src/lib/receipts.tsx) can drop this page in
// directly alongside other pages in one Document — react-pdf documents
// can't be nested, only their Page children can be composed.
export function BoxCricketIdCardPage({ data }: { data: BoxCricketIdCardData }) {
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

      <View style={styles.teamNameClear} />
      <Text
        style={[
          styles.teamNameText,
          { fontSize: teamNameFontSize(data.teamName ?? "TEAM") },
        ]}
      >
        {(data.teamName ?? "Team").toUpperCase()}
      </Text>

      <View style={styles.uniqueIdClear} />
      <Text style={styles.uniqueIdBannerText}>{data.uniqueId}</Text>

      <Text style={styles.courtLabel}>BOX CRICKET</Text>

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
