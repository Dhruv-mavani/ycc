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

// Box Cricket ("team") gets its own certificate-style design instead of
// the envelope-photo one above — a plain ornate blue border with no
// baked-in logo (public/box_cricket_certificate/certificate-frame.png,
// native 2000x1414). That's an almost exact A4-landscape ratio
// (2000/1414 = 1.4144 vs. true A4's 1.4142), so it's meant to fill a
// landscape page edge-to-edge rather than being centered/cropped like the
// square envelope art. Scoped to Box Cricket only — the Partner Program
// side of this file (kind: "partner") is untouched.
const teamBgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/box_cricket_certificate/certificate-frame.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();
const teamLogoDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/superchamps/ycc-logo-cropped.png"),
  );
  return `data:image/png;base64,${buffer.toString("base64")}`;
})();

// Rounded to whole points rather than true A4 landscape (841.89 x 595.28)
// — react-pdf's layout engine has a confirmed bug where a fractional page
// height silently overflows content onto a phantom second page (same fix
// already applied in superchamps-certificate.tsx for this exact 2000x1414
// art; see that file's comment for the bisection that found it).
const TEAM_PAGE_WIDTH = 842;
const TEAM_PAGE_HEIGHT = 595;
const TEAM_ART_NATIVE_W = 2000;
const TEAM_ART_NATIVE_H = 1414;
const TEAM_SCALE_X = TEAM_PAGE_WIDTH / TEAM_ART_NATIVE_W;
const TEAM_SCALE_Y = TEAM_PAGE_HEIGHT / TEAM_ART_NATIVE_H;
const ts = (value: number) => value * TEAM_SCALE_X;
const tsy = (value: number) => value * TEAM_SCALE_Y;

// The border artwork's safe interior — pixel-scanned from the source PNG
// (mask of non-near-white pixels), not eyeballed: the widest fully clear
// vertical band spans y 147-1266 across x 200-1800, i.e. this rectangle
// never touches any corner flourish or the thin mid-height side lines.
// Content below is laid out inside this box, in the same native-pixel
// space as the scan, then converted to points via ts()/tsy().
const TEAM_SAFE_X = 200;
const TEAM_SAFE_W = 1600; // 1800 - 200
const TEAM_SAFE_Y = 150;

const TEAM_LOGO_W = 480; // native px; height follows the source's own 866:301 ratio
const TEAM_LOGO_H = (TEAM_LOGO_W * 301) / 866;
const TEAM_NAVY = "#173a8f";
const TEAM_LOGO_BLUE = "#2a5e9a";
const TEAM_TEXT_DARK = "#2a2118";

const teamStyles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TEAM_PAGE_WIDTH,
    height: TEAM_PAGE_HEIGHT,
  },
  logo: {
    position: "absolute",
    top: tsy(TEAM_SAFE_Y + 40),
    left: ts(TEAM_SAFE_X + TEAM_SAFE_W / 2 - TEAM_LOGO_W / 2),
    width: ts(TEAM_LOGO_W),
    height: tsy(TEAM_LOGO_H),
  },
  dearLine: {
    position: "absolute",
    left: ts(TEAM_SAFE_X),
    width: ts(TEAM_SAFE_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(58),
    color: TEAM_LOGO_BLUE,
  },
  name: {
    position: "absolute",
    left: ts(TEAM_SAFE_X),
    width: ts(TEAM_SAFE_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(54),
    color: TEAM_NAVY,
  },
  paragraph: {
    position: "absolute",
    left: ts(TEAM_SAFE_X + 150),
    width: ts(TEAM_SAFE_W - 300),
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: ts(30),
    lineHeight: 1.45,
    color: TEAM_TEXT_DARK,
  },
  box: {
    position: "absolute",
    top: tsy(830),
    width: ts(720),
    border: `${ts(1.5)} solid ${TEAM_NAVY}`,
    borderRadius: ts(6),
    paddingVertical: ts(16),
    paddingHorizontal: ts(20),
  },
  boxTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: ts(24),
    letterSpacing: ts(1.5),
    color: TEAM_NAVY,
    textAlign: "center",
    marginBottom: ts(10),
  },
  boxRow: {
    fontFamily: "Helvetica",
    fontSize: ts(20),
    lineHeight: 1.5,
    color: TEAM_TEXT_DARK,
    textAlign: "center",
  },
  boxRowLabel: {
    fontFamily: "Helvetica-Bold",
  },
  closing: {
    position: "absolute",
    left: ts(TEAM_SAFE_X),
    width: ts(TEAM_SAFE_W),
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(40),
    color: TEAM_LOGO_BLUE,
  },
});

// Two boxes side by side, each TEAM_LOGO_W-independent 720-native wide,
// centered as a pair within the safe content width with a gap between —
// landscape has the width to spare, so putting Team Details and the ID
// Card notice side by side keeps the whole block well clear of the safe
// zone's bottom edge (y 1266) instead of stacking them the way the
// taller portrait design does.
const TEAM_BOX_GAP = 160;
const TEAM_BOX_LEFT_X =
  TEAM_SAFE_X + (TEAM_SAFE_W - 720 * 2 - TEAM_BOX_GAP) / 2;
const TEAM_BOX_RIGHT_X = TEAM_BOX_LEFT_X + 720 + TEAM_BOX_GAP;

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
  detailsRow: {
    fontFamily: "Helvetica",
    fontSize: s(12.5),
    lineHeight: 1.5,
    color: TEXT_DARK,
    textAlign: "center",
  },
  detailsLabel: {
    fontFamily: "Helvetica-Bold",
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

export type InvitationLetterData =
  | { kind: "partner"; name: string; code: string; partnerType: "campus" | "class" | "classmate" }
  | {
      kind: "team";
      teamName: string;
      eventName: string;
      collegeName: string;
      captainName: string | null;
      /** Non-captain roster — the captain is already shown on its own line. */
      players: string[];
    };

export function InvitationLetterPage(data: InvitationLetterData) {
  if (data.kind === "team") {
    // Underline centered under the team name, sized for the wider
    // landscape safe zone — a fixed width reads as a deliberate
    // signature-line accent regardless of name length, same idea as
    // NameUnderline below (kept separate since the two pages don't share a
    // coordinate space).
    const underlineNativeW = 460;
    const underlineCenterX = TEAM_SAFE_X + TEAM_SAFE_W / 2;

    return (
      <Page size={[TEAM_PAGE_WIDTH, TEAM_PAGE_HEIGHT]} style={teamStyles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={teamBgDataUri} style={teamStyles.background} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={teamLogoDataUri} style={teamStyles.logo} />

        <Text style={[teamStyles.dearLine, { top: tsy(420) }]}>Dear,</Text>
        <Text style={[teamStyles.name, { top: tsy(500) }]}>{data.teamName}</Text>
        <Svg
          style={{ position: "absolute", top: tsy(572), left: 0 }}
          width={TEAM_PAGE_WIDTH}
          height={tsy(6)}
        >
          <Line
            x1={ts(underlineCenterX - underlineNativeW / 2)}
            y1={tsy(3)}
            x2={ts(underlineCenterX + underlineNativeW / 2)}
            y2={tsy(3)}
            stroke={TEAM_LOGO_BLUE}
            strokeWidth={ts(2.5)}
            strokeLinecap="round"
          />
        </Svg>

        <Text style={[teamStyles.paragraph, { top: tsy(630) }]}>
          Congratulations on registering for the {data.eventName}! Your team
          is officially confirmed — get your squad ready, stay sharp, and
          bring your best game on match day. Schedules, venue details and
          every update will be shared on our official channels.
        </Text>

        <View style={[teamStyles.box, { left: ts(TEAM_BOX_LEFT_X) }]}>
          <Text style={teamStyles.boxTitle}>Team Details</Text>
          <Text style={teamStyles.boxRow}>
            <Text style={teamStyles.boxRowLabel}>College: </Text>
            {data.collegeName}
          </Text>
          {data.captainName ? (
            <Text style={teamStyles.boxRow}>
              <Text style={teamStyles.boxRowLabel}>Captain: </Text>
              {data.captainName}
            </Text>
          ) : null}
          {data.players.length > 0 ? (
            <Text style={teamStyles.boxRow}>
              <Text style={teamStyles.boxRowLabel}>Players: </Text>
              {data.players.join(", ")}
            </Text>
          ) : null}
        </View>

        <View style={[teamStyles.box, { left: ts(TEAM_BOX_RIGHT_X) }]}>
          <Text style={teamStyles.boxTitle}>ID Card Mandatory</Text>
          <Text style={teamStyles.boxRow}>
            Every player must carry their ID card print or pdf (attached
            right after this letter) to the venue — entry will not be
            permitted without it. Keep it safe until match day.
          </Text>
        </View>

        <Text style={[teamStyles.closing, { top: tsy(1060) }]}>
          See you on the ground!
        </Text>
      </Page>
    );
  }

  const { name, code, partnerType } = data;
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
