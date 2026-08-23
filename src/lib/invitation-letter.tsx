import "server-only";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
  Svg,
  Line,
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

// Page matches the Class Partner certificate's other pages — this letter
// is now the opening page of that same combined PDF (see
// src/lib/class-partner-certificate.tsx), rather than a standalone A4
// page, so it stays consistent alongside the certificate ticket page.
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
const BLOCK_Y = 540;
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
  dearLine: {
    position: "absolute",
    top: ART_TOP + s(BLOCK_Y),
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: s(38),
    color: LOGO_BLUE,
  },
  name: {
    position: "absolute",
    top: ART_TOP + s(BLOCK_Y + 46),
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: s(36),
    color: NAVY,
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
  codeLabel: {
    position: "absolute",
    left: s(BLOCK_X),
    width: s(BLOCK_W),
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: s(20),
    letterSpacing: s(2),
    color: NAVY,
  },
});

// Underline width in native (1254) units — a fixed, generous width reads
// as a deliberate signature-line accent regardless of how long the name
// is, rather than trying to hug the text exactly.
const UNDERLINE_W = 340;

function NameUnderline({ top }: { top: number }) {
  const x1 = BLOCK_X + BLOCK_W / 2 - UNDERLINE_W / 2;
  const x2 = BLOCK_X + BLOCK_W / 2 + UNDERLINE_W / 2;
  return (
    <Svg
      style={{ position: "absolute", top, left: 0 }}
      width={PAGE_WIDTH}
      height={s(6)}
    >
      <Line
        x1={s(x1)}
        y1={s(3)}
        x2={s(x2)}
        y2={s(3)}
        stroke={LOGO_BLUE}
        strokeWidth={s(2.5)}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export interface InvitationLetterData {
  name: string;
  code: string;
  partnerType: "campus" | "class" | "classmate";
}

export function InvitationLetterPage({
  name,
  code,
  partnerType,
}: InvitationLetterData) {
  const isSquad = partnerType === "classmate";
  const roleLabel = isSquad ? "Squad Member" : partnerType === "class" ? "Co-Partner" : "Partner";
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      <Text style={styles.dearLine}>Dear, {roleLabel}</Text>
      <Text style={styles.name}>{name}</Text>
      <NameUnderline top={ART_TOP + s(BLOCK_Y + 92)} />

      {isSquad ? (
        <>
          <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 122) }]}>
            Thank you for registering with YCC! You&apos;re now officially
            part of the YCC Squad, and we&apos;re excited to have you with
            us on the ground.
          </Text>

          <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 178) }]}>
            Stay tuned and stay active — match schedules, event details and
            every update will be shared right here, so keep an eye on your
            phone and our official channels.
          </Text>

          <View style={[styles.noticeBox, { top: ART_TOP + s(BLOCK_Y + 280) }]}>
            <Text style={styles.noticeTitle}>Stay Connected</Text>
            <Text style={styles.noticeBody}>
              Join our WhatsApp channel and follow us on Instagram so you
              never miss a match day, event, or announcement.
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 122) }]}>
            You are warmly invited to join the YCC Partner Program as an
            official YCC {roleLabel}.
          </Text>

          <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 178) }]}>
            We look forward to building a strong collaboration and growing
            together through YCC events, campaigns, tournaments and special
            partner activities.
          </Text>

          <View style={[styles.noticeBox, { top: ART_TOP + s(BLOCK_Y + 280) }]}>
            <Text style={styles.noticeTitle}>Share Your Code</Text>
            <Text style={styles.noticeBody}>
              Pass your code to everyone joining under you — it&apos;s how
              they&apos;ll register. Keep this certificate handy until your
              squad is complete!
            </Text>
          </View>
        </>
      )}

      {isSquad ? null : (
        <Text style={[styles.codeLabel, { top: ART_TOP + s(BLOCK_Y + 388) }]}>
          {code}
        </Text>
      )}
    </Page>
  );
}

export async function renderInvitationLetterPdf(
  data: InvitationLetterData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <InvitationLetterPage {...data} />
    </Document>,
  );
}
