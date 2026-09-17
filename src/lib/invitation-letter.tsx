import "server-only";
import { Fragment } from "react";
import type { Style } from "@react-pdf/types";
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

// Content is laid out as a normal top-to-bottom flow inside one
// absolutely-positioned column (anchored to the safe zone's top-left),
// rather than each element getting its own hand-computed absolute `top` —
// the body copy's length varies with roster size and event/college name
// length, so fixed pixel offsets would risk overlap for anything longer
// than whatever sample text they were tuned against. Flow means each
// element's position instead just follows from the actual rendered height
// of everything above it.
const teamStyles = StyleSheet.create({
  page: { position: "relative" },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: TEAM_PAGE_WIDTH,
    height: TEAM_PAGE_HEIGHT,
  },
  content: {
    position: "absolute",
    top: tsy(TEAM_SAFE_Y + 30),
    left: ts(TEAM_SAFE_X),
    width: ts(TEAM_SAFE_W),
    alignItems: "center",
  },
  logo: {
    width: ts(TEAM_LOGO_W),
    height: tsy(TEAM_LOGO_H),
    marginBottom: tsy(70),
  },
  passTitle: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: ts(32),
    letterSpacing: ts(3),
    color: TEAM_NAVY,
    marginBottom: tsy(40),
  },
  // Alex Brush's space glyph renders at near-zero width in react-pdf/pdfkit
  // — a multi-word team name like "SCET Titans" collapses into
  // "SCETTitans" without help, and the same happens to *any* plain-string
  // separator (", " etc.) sitting directly between two Alex Brush runs
  // (see rosterLine/rosterLabel). letterSpacing is the only
  // inter-character control react-pdf exposes, so it's applied to every
  // style that either uses this font directly, or wraps text adjacent to
  // it — it does nudge apart letters *within* a word too, but at this
  // small a value the cursive strokes still read as connected, and it's
  // the only way to open up the actual word gaps.
  dearLine: {
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(46),
    letterSpacing: ts(10),
    color: TEAM_LOGO_BLUE,
  },
  nameLine: {
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(42),
    letterSpacing: ts(10),
    color: TEAM_NAVY,
  },
  underline: {
    marginTop: tsy(12),
    marginBottom: tsy(32),
  },
  paragraph: {
    width: ts(TEAM_SAFE_W - 160),
    textAlign: "center",
    fontFamily: "Times-Italic",
    fontSize: ts(21),
    lineHeight: 1.28,
    color: TEAM_TEXT_DARK,
    marginBottom: tsy(36),
  },
  // Captain/player names inline within the paragraph prose — same script
  // family as "Dear," and the team name, scaled up from the surrounding
  // "Cap:" label so the names themselves read clearly at a glance.
  inlineName: {
    fontFamily: "Alex Brush",
    fontSize: ts(32),
    letterSpacing: ts(3),
    color: TEAM_NAVY,
  },
  rosterHeading: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: ts(16),
    letterSpacing: ts(1.5),
    color: TEAM_NAVY,
    marginTop: tsy(8),
    marginBottom: tsy(14),
  },
  rosterLine: {
    width: ts(TEAM_SAFE_W - 160),
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: ts(16),
    letterSpacing: ts(3),
    color: TEAM_TEXT_DARK,
    marginBottom: tsy(10),
  },
  rosterLabel: {
    fontFamily: "Helvetica-Bold",
    letterSpacing: ts(3),
  },
  box: {
    width: ts(760),
    marginTop: tsy(50),
    border: `${ts(1.5)} solid ${TEAM_NAVY}`,
    borderRadius: ts(6),
    paddingVertical: ts(10),
    paddingHorizontal: ts(18),
  },
  boxTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: ts(18),
    letterSpacing: ts(1.5),
    color: TEAM_NAVY,
    textAlign: "center",
    marginBottom: ts(6),
  },
  boxRow: {
    fontFamily: "Helvetica",
    fontSize: ts(16),
    lineHeight: 1.3,
    color: TEAM_TEXT_DARK,
    textAlign: "center",
  },
  detailLine: {
    fontFamily: "Helvetica",
    fontSize: ts(18),
    color: TEAM_TEXT_DARK,
    textAlign: "center",
    marginBottom: tsy(14),
  },
  detailLabel: {
    fontFamily: "Helvetica-Bold",
  },
  closing: {
    textAlign: "center",
    fontFamily: "Alex Brush",
    fontSize: ts(28),
    letterSpacing: ts(3),
    color: TEAM_LOGO_BLUE,
    marginTop: tsy(40),
  },
  tandc: {
    textAlign: "center",
    fontFamily: "Helvetica",
    fontSize: ts(9),
    color: "#8a8580",
    marginTop: tsy(28),
  },
});

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
      /** Non-captain roster — woven into the congrats paragraph alongside the captain, not shown separately. */
      players: string[];
    };

type TextStyleProp = Style | Style[];

// Renders a name list as "a, b, and c" (Oxford comma) but with each NAME
// itself wrapped in its own styled <Text> (the script inlineName style) —
// the separators ("," / ", and ") are plain siblings so they stay in the
// surrounding paragraph's own font rather than inheriting the name style.
function NameList({
  names,
  nameStyle,
  useAnd = true,
}: {
  names: string[];
  nameStyle: TextStyleProp;
  /** false for a plain "A, B, C" roster list rather than "A, B, and C" prose. */
  useAnd?: boolean;
}) {
  return (
    <>
      {names.map((name, i) => {
        const isLast = i === names.length - 1;
        const isSecondLast = i === names.length - 2;
        const sep = isLast ? "" : useAnd && isSecondLast ? ", and " : ", ";
        return (
          <Fragment key={i}>
            <Text style={nameStyle}>{name}</Text>
            {sep}
          </Fragment>
        );
      })}
    </>
  );
}

// "Cap: {captain}, {player1}, {player2}, ..." — a plain roster list (no
// "and" before the last name; this reads as a label + list, not prose),
// captain first and unlabeled beyond the leading "Cap:" since their
// position in the list already marks them out.
function TeamRosterLine({
  captainName,
  players,
  nameStyle,
}: {
  captainName: string | null;
  players: string[];
  nameStyle: TextStyleProp;
}) {
  const names = captainName ? [captainName, ...players] : players;
  if (names.length === 0) return null;
  return (
    <Text style={teamStyles.rosterLine}>
      <Text style={teamStyles.rosterLabel}>Cap: </Text>
      <NameList names={names} nameStyle={nameStyle} useAnd={false} />
    </Text>
  );
}

export function InvitationLetterPage(data: InvitationLetterData) {
  if (data.kind === "team") {
    // Underline width, in native units — a fixed, generous width reads as
    // a deliberate signature-line accent regardless of name length, same
    // idea as NameUnderline below. Local to the Svg's own box now (flow
    // layout, not page-absolute), so it's just 0..width, no center-offset
    // math needed.
    const underlineNativeW = 420;

    return (
      <Page size={[TEAM_PAGE_WIDTH, TEAM_PAGE_HEIGHT]} style={teamStyles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
        <Image src={teamBgDataUri} style={teamStyles.background} />

        <View style={teamStyles.content}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
          <Image src={teamLogoDataUri} style={teamStyles.logo} />

          <Text style={teamStyles.passTitle}>OFFICIAL TEAM INVITATION PASS</Text>

          <Text style={teamStyles.dearLine}>Dear Team,</Text>
          <Text style={teamStyles.nameLine}>Team {data.teamName}</Text>
          <Svg
            style={[{ alignSelf: "center" }, teamStyles.underline]}
            width={ts(underlineNativeW)}
            height={tsy(6)}
          >
            <Line
              x1={0}
              y1={tsy(3)}
              x2={ts(underlineNativeW)}
              y2={tsy(3)}
              stroke={TEAM_LOGO_BLUE}
              strokeWidth={ts(2.5)}
              strokeLinecap="round"
            />
          </Svg>

          <Text style={teamStyles.rosterHeading}>FELLOW TEAM MEMBERS</Text>
          <TeamRosterLine
            captainName={data.captainName}
            players={data.players}
            nameStyle={teamStyles.inlineName}
          />
          <Svg
            style={[{ alignSelf: "center" }, teamStyles.underline]}
            width={ts(underlineNativeW)}
            height={tsy(6)}
          >
            <Line
              x1={0}
              y1={tsy(3)}
              x2={ts(underlineNativeW)}
              y2={tsy(3)}
              stroke={TEAM_LOGO_BLUE}
              strokeWidth={ts(2.5)}
              strokeLinecap="round"
            />
          </Svg>

          <Text style={teamStyles.paragraph}>
            Congratulations! Your team has been officially invited and
            registered to play in the {data.eventName}. We&apos;re excited to
            have you with us! We truly believe that your team&apos;s
            participation will make the tournament more exciting, energetic,
            memorable, and full of masti and fun.
          </Text>

          <Text style={[teamStyles.detailLine, { marginTop: tsy(14) }]}>
            <Text style={teamStyles.detailLabel}>College: </Text>
            {data.collegeName}
          </Text>
          <Text style={teamStyles.detailLine}>
            <Text style={teamStyles.detailLabel}>Team Name: </Text>
            {data.teamName}
          </Text>

          <View style={teamStyles.box}>
            <Text style={teamStyles.boxTitle}>ID Card Mandatory</Text>
            <Text style={teamStyles.boxRow}>
              Every player must carry their ID card print or pdf (attached
              right after this letter) to the venue — entry will not be
              permitted without it. Keep it safe until match day.
            </Text>
          </View>

          <Text style={[teamStyles.paragraph, { marginTop: tsy(50), marginBottom: 0 }]}>
            For all schedules, venue details, match updates, and
            announcements, stay connected with our official social media
            channels.
          </Text>

          <Text style={teamStyles.closing}>See you on the ground!</Text>

          <Text style={teamStyles.tandc}>T&amp;C Applied</Text>
        </View>
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
