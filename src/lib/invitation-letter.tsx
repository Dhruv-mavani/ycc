import "server-only";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";

// Statically analyzable path so Next's file tracing bundles the font into
// the serverless function on Vercel; react-pdf's own file resolution isn't
// reliably traced there. Same font already used by the Class Partner
// certificate (src/lib/class-partner-certificate.tsx).
const alexBrushFontPath = path.join(
  process.cwd(),
  "public/fonts/AlexBrush-Regular.ttf",
);
Font.register({ family: "Alex Brush", src: alexBrushFontPath });

// Background is a photo of an opened envelope + card (public/invitation_sample/
// invitation-card-bg.jpg), native 1254x1254 square. The YCC logo is printed
// top-left; the rest of the card is genuinely blank cream paper (this is
// the second, cleaned-up version of the source asset — no baked-in
// placeholder text to paint over anymore), so we just place real,
// personalized copy directly onto it.
const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/invitation_sample/invitation-card-bg.jpg"),
  );
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
})();

// Page matches the receipt page's A4 size, rather than the art's native
// 1254x1254 square — the letter was previously rendered at that huge native
// size, making it a giant outlier page next to the A4 receipt/ID cards.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

// The square art is scaled to fill the page width and centered vertically,
// so the whole envelope+card stays visible (no cropping) and every
// coordinate below — copied from the original 1254-native layout — is
// scaled by the same factor via `s()`.
const ART_NATIVE = 1254;
const SCALE = PAGE_WIDTH / ART_NATIVE;
const ART_SIZE = PAGE_WIDTH;
const ART_TOP = (PAGE_HEIGHT - ART_SIZE) / 2;
const s = (value: number) => value * SCALE;

const NAVY = "#173a8f";
// Averaged from the "YCC" wordmark's own pixels (sampled from the source
// image) so the greeting reads as part of the same brand mark, not a
// mismatched blue.
const LOGO_BLUE = "#2a5e9a";
const TEXT_DARK = "#2a2118";

// Bounds of the blank writable area, in the art's native 1254-space: the
// logo occupies roughly x 380-1180, y 170-410 (measured by pixel-scanning
// the source image), so the block starts with enough clearance below it to
// avoid crowding the subtitle; the bottom stays clear of the fold shadow
// where the card tucks into the envelope's front flap (~y 1130), measured
// the same way.
const BLOCK_X = 140;
const BLOCK_Y = 500;
const BLOCK_W = ART_NATIVE - BLOCK_X * 2; // 974

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: ART_TOP,
    left: 0,
    width: ART_SIZE,
    height: ART_SIZE,
  },
  greeting: {
    position: "absolute",
    top: ART_TOP + s(BLOCK_Y + 40),
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: s(56),
    color: LOGO_BLUE,
  },
  paragraph: {
    position: "absolute",
    left: s(BLOCK_X + 90),
    width: s(BLOCK_W - 180),
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: s(21),
    lineHeight: 1.5,
    color: TEXT_DARK,
  },
  noticeBox: {
    position: "absolute",
    left: s(BLOCK_X + 75),
    width: s(BLOCK_W - 150),
    border: `${s(1.5)} solid ${NAVY}`,
    borderRadius: s(6),
    paddingVertical: s(16),
    paddingHorizontal: s(22),
  },
  noticeTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: s(14),
    letterSpacing: s(1.5),
    color: NAVY,
    textAlign: "center",
    marginBottom: s(8),
  },
  noticeBody: {
    fontFamily: "Helvetica",
    fontSize: s(12.5),
    lineHeight: 1.5,
    color: TEXT_DARK,
    textAlign: "center",
  },
  signoffLine: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: s(30),
    color: NAVY,
  },
  signoffName: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: s(42),
    color: NAVY,
  },
});

export function InvitationLetterPage({ name }: { name: string }) {
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      <Text style={styles.greeting}>Dear {name},</Text>

      <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 120) }]}>
        Welcome to Yuva Champions Cricket! We&apos;re thrilled to have you
        with us — your registration is confirmed, and the countdown to game
        day has begun.
      </Text>

      <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 230) }]}>
        Right below this letter, you&apos;ll find your official Payment
        Receipt and your personalized ID Card.
      </Text>

      <View style={[styles.noticeBox, { top: ART_TOP + s(BLOCK_Y + 320) }]}>
        <Text style={styles.noticeTitle}>Before You Head Out</Text>
        <Text style={styles.noticeBody}>
          Carry your ID Card to the venue — printed, or saved as this PDF on
          your phone. Entry and attendance will be marked Present or Absent
          strictly on the basis of this card, so please don&apos;t forget
          it on the big day!
        </Text>
      </View>

      <Text style={[styles.signoffLine, { top: ART_TOP + s(BLOCK_Y + 505) }]}>
        See you on the field,
      </Text>
      <Text style={[styles.signoffName, { top: ART_TOP + s(BLOCK_Y + 550) }]}>
        Team YCC
      </Text>
    </Page>
  );
}

export async function renderInvitationLetterPdf(name: string): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <InvitationLetterPage name={name} />
    </Document>,
  );
}
