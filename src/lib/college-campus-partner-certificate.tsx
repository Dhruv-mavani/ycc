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

// Same assets/layout approach as the Partner Program certificate's
// "partner" kind (src/lib/invitation-letter.tsx) — kept as a standalone
// file rather than extending that shared one, since this is a distinct
// flow (College Campus Partner) with its own table and copy.
const alexBrushFontPath = path.join(
  process.cwd(),
  "public/fonts/AlexBrush-Regular.ttf",
);
Font.register({ family: "Alex Brush", src: alexBrushFontPath });

const bgDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/invitation_sample/invitation-card-bg.jpg"),
  );
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
})();

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const ART_NATIVE = 1254;
const SCALE = PAGE_WIDTH / ART_NATIVE;
const ART_SIZE = PAGE_WIDTH;
const ART_TOP = (PAGE_HEIGHT - ART_SIZE) / 2;
const s = (value: number) => value * SCALE;

const NAVY = "#173a8f";
const LOGO_BLUE = "#2a5e9a";
const TEXT_DARK = "#2a2118";

const BLOCK_X = 140;
const BLOCK_Y = 540;
const BLOCK_W = ART_NATIVE - BLOCK_X * 2;

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

export interface CollegeCampusPartnerCertificateData {
  name: string;
  code: string;
}

export function CollegeCampusPartnerCertificatePage({
  name,
  code,
}: CollegeCampusPartnerCertificateData) {
  return (
    <Page size="A4" style={styles.page}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image */}
      <Image src={bgDataUri} style={styles.background} />

      <Text style={styles.dearLine}>Dear, Campus Partner</Text>
      <Text style={styles.name}>{name}</Text>
      <NameUnderline top={ART_TOP + s(BLOCK_Y + 92)} />

      <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 122) }]}>
        You are warmly invited to join YCC as an official YCC College Campus
        Partner.
      </Text>

      <Text style={[styles.paragraph, { top: ART_TOP + s(BLOCK_Y + 178) }]}>
        We look forward to building a strong collaboration and growing
        together through YCC events, campaigns, tournaments and special
        partner activities on your campus.
      </Text>

      <View style={[styles.noticeBox, { top: ART_TOP + s(BLOCK_Y + 280) }]}>
        <Text style={styles.noticeTitle}>Your Code</Text>
        <Text style={styles.noticeBody}>
          Keep this certificate handy — your code below is your personal
          identifier with YCC.
        </Text>
      </View>

      <Text style={[styles.codeLabel, { top: ART_TOP + s(BLOCK_Y + 388) }]}>
        {code}
      </Text>
    </Page>
  );
}

export async function renderCollegeCampusPartnerCertificatePdf(
  data: CollegeCampusPartnerCertificateData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <CollegeCampusPartnerCertificatePage {...data} />
    </Document>,
  );
}
