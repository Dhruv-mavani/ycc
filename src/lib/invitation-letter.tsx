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
// invitation-card-bg.jpg), native 1254x1254. It ships with the YCC logo
// already printed at the top; the rest of the card was a generic template
// ("Dear Sophia... my new Lou Camera Bag..."), which we paint over with a
// solid rect matching the paper tone (measured off the image, not eyeballed)
// and replace with real, personalized copy — same "clear-and-redraw"
// approach as the ID card backgrounds.
const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/invitation_sample/invitation-card-bg.jpg"),
  );
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
})();

const PAGE_WIDTH = 1254;
const PAGE_HEIGHT = 1254;

// Paper tone sampled from the card's blank margins, clear of any of the
// template's original text — see conversation notes; this keeps the
// repainted block indistinguishable from the surrounding card.
const PAPER = "#ede6db";
const NAVY = "#173a8f";
const TEXT_DARK = "#2a2118";

// Bounds of the original template's text block (from just below the "YUVA
// CHAMPIONS CRICKET" wordmark to just above where the card tucks into the
// envelope's front flap), measured the same way.
const BLOCK_X = 140;
const BLOCK_Y = 300;
const BLOCK_W = PAGE_WIDTH - BLOCK_X * 2; // 974
const BLOCK_H = 760;

const styles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  clear: {
    position: "absolute",
    top: BLOCK_Y,
    left: BLOCK_X,
    width: BLOCK_W,
    height: BLOCK_H,
    backgroundColor: PAPER,
  },
  greeting: {
    position: "absolute",
    top: BLOCK_Y + 45,
    left: BLOCK_X,
    width: BLOCK_W,
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: 56,
    color: NAVY,
  },
  paragraph: {
    position: "absolute",
    left: BLOCK_X + 90,
    width: BLOCK_W - 180,
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: 21,
    lineHeight: 1.5,
    color: TEXT_DARK,
  },
  noticeBox: {
    position: "absolute",
    left: BLOCK_X + 75,
    width: BLOCK_W - 150,
    border: `1.5 solid ${NAVY}`,
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  noticeTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    letterSpacing: 1.5,
    color: NAVY,
    textAlign: "center",
    marginBottom: 8,
  },
  noticeBody: {
    fontFamily: "Helvetica",
    fontSize: 12.5,
    lineHeight: 1.5,
    color: TEXT_DARK,
    textAlign: "center",
  },
  signoffLine: {
    position: "absolute",
    left: BLOCK_X,
    width: BLOCK_W,
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: 30,
    color: NAVY,
  },
  signoffName: {
    position: "absolute",
    left: BLOCK_X,
    width: BLOCK_W,
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: 42,
    color: NAVY,
  },
});

export function InvitationLetterPage({ name }: { name: string }) {
  return (
    <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      <View style={styles.clear} />

      <Text style={styles.greeting}>Dear {name},</Text>

      <Text style={[styles.paragraph, { top: BLOCK_Y + 130 }]}>
        Welcome to Yuva Champions Cricket! We&apos;re thrilled to have you
        with us — your registration is confirmed, and the countdown to game
        day has begun.
      </Text>

      <Text style={[styles.paragraph, { top: BLOCK_Y + 245 }]}>
        Right below this letter, you&apos;ll find your official Payment
        Receipt and your personalized ID Card.
      </Text>

      <View style={[styles.noticeBox, { top: BLOCK_Y + 335 }]}>
        <Text style={styles.noticeTitle}>Before You Head Out</Text>
        <Text style={styles.noticeBody}>
          Carry your ID Card to the venue — printed, or saved as this PDF on
          your phone. Entry and attendance will be marked Present or Absent
          strictly on the basis of this card, so please don&apos;t forget
          it on the big day!
        </Text>
      </View>

      <Text style={[styles.signoffLine, { top: BLOCK_Y + 545 }]}>
        See you on the field,
      </Text>
      <Text style={[styles.signoffName, { top: BLOCK_Y + 595 }]}>
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
