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
import { calculateGst } from "@/lib/gst";

// Read via fs.readFileSync (statically analyzable path) so Next's file
// tracing bundles the logo into serverless functions; react-pdf's own file
// resolution isn't reliably traced on Vercel.
const logoDataUri = (() => {
  const buffer = fs.readFileSync(
    path.join(process.cwd(), "public/brand/ycc-logo.jpg"),
  );
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
})();

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  // --- Invoice-style header (mirrors the reference sample: org block
  // top-left, order reference top-right) ---
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  orgBlock: { flexDirection: "row", alignItems: "center" },
  logo: { width: 60, height: 60, marginRight: 10 },
  orgName: { fontSize: 15, fontWeight: 700, color: "#1d4ed8" },
  orgSubtitle: { fontSize: 8, color: "#555" },
  metaBlock: { alignItems: "flex-end" },
  metaLabel: { fontSize: 8, color: "#555" },
  metaValue: { fontSize: 12, fontWeight: 700, color: "#1d4ed8" },
  metaValueSmall: { fontSize: 9, fontWeight: 700, color: "#333" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #e5e7eb",
    borderBottom: "1 solid #e5e7eb",
    paddingVertical: 10,
    marginBottom: 16,
  },
  infoCol: { flexDirection: "column" },
  infoLabel: { fontSize: 9, fontWeight: 700, color: "#111", marginBottom: 2 },
  infoValue: { fontSize: 10, color: "#333" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111",
  },
  // --- Order summary table (mirrors the reference invoice sample: No. /
  // Item / Qty / IGST / SGST / CGST / Price, plus Sub Total / Total Tax /
  // Payable Total rows) ---
  table: { border: "1 solid #e5e7eb", borderRadius: 2, marginBottom: 10 },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1d4ed8",
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderTop: "1 solid #e5e7eb",
  },
  colNo: { width: "6%", paddingHorizontal: 4 },
  colItem: { width: "32%", paddingHorizontal: 4 },
  colQty: { width: "8%", paddingHorizontal: 4, textAlign: "center" },
  colTax: { width: "13%", paddingHorizontal: 4, textAlign: "center" },
  colPrice: { width: "16%", paddingHorizontal: 4, textAlign: "right" },
  th: { color: "#fff", fontSize: 7.5, fontWeight: 700 },
  td: { fontSize: 9, color: "#111" },
  summaryBlock: {
    alignSelf: "flex-end",
    width: "55%",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryLabel: { fontSize: 9, color: "#555" },
  summaryValue: { fontSize: 9, color: "#111" },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 3,
    borderTop: "1 solid #1d4ed8",
  },
  summaryTotalLabel: { fontSize: 11, fontWeight: 700, color: "#111" },
  summaryTotalValue: { fontSize: 14, fontWeight: 700, color: "#1d4ed8" },
  section: { marginBottom: 14 },
  participantCard: {
    flexDirection: "row",
    alignItems: "center",
    border: "1 solid #e5e7eb",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  qr: { width: 140, height: 140, marginRight: 16 },
  participantInfo: { flexDirection: "column" },
  participantName: { fontSize: 13, fontWeight: 700 },
  uniqueId: { fontSize: 16, fontWeight: 700, color: "#1d4ed8", marginTop: 4 },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
});

export interface ReceiptParticipant {
  name: string;
  uniqueId: string;
  qrDataUrl: string;
}

export interface ReceiptData {
  registrationId: string;
  eventName: string;
  collegeName: string;
  teamName: string | null;
  type: "team" | "individual";
  /** Base (pre-tax) price for this registration — GST is computed from this. */
  basePaise: number;
  paidAt: string;
  razorpayPaymentId: string | null;
  captainName: string | null;
  participants: ReceiptParticipant[];
}

function formatRupees(paise: number) {
  return `Rs. ${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ReceiptDocument({ data }: { data: ReceiptData }) {
  // The invoice header shows the primary contact's unique ID as the
  // transaction reference; every participant still gets their own
  // unique ID + QR in the roster section below.
  const referenceId = data.participants[0]?.uniqueId ?? data.registrationId;
  const itemLabel =
    data.type === "team"
      ? `${data.eventName} — ${data.teamName ?? "Team Registration"}`
      : `${data.eventName} — Individual Entry`;

  const gst = calculateGst(data.basePaise);
  const totalTaxPaise = gst.cgstPaise + gst.sgstPaise + gst.igstPaise;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.orgBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image; no alt concept in PDF */}
            <Image src={logoDataUri} style={styles.logo} />
            <View>
              <Text style={styles.orgName}>Yuva Champions Cricket</Text>
              <Text style={styles.orgSubtitle}>Payment Receipt</Text>
            </View>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Unique ID</Text>
            <Text style={styles.metaValue}>{referenceId}</Text>
            {data.razorpayPaymentId ? (
              <>
                <Text style={[styles.metaLabel, { marginTop: 4 }]}>
                  Transaction ID
                </Text>
                <Text style={styles.metaValueSmall}>
                  {data.razorpayPaymentId}
                </Text>
              </>
            ) : null}
            <Text style={[styles.metaLabel, { marginTop: 4 }]}>
              {new Date(data.paidAt).toLocaleDateString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{data.captainName ?? "-"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>College</Text>
            <Text style={styles.infoValue}>{data.collegeName}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colNo, styles.th]}>No.</Text>
            <Text style={[styles.colItem, styles.th]}>Item</Text>
            <Text style={[styles.colQty, styles.th]}>Qty</Text>
            <Text style={[styles.colTax, styles.th]}>IGST</Text>
            <Text style={[styles.colTax, styles.th]}>SGST</Text>
            <Text style={[styles.colTax, styles.th]}>CGST</Text>
            <Text style={[styles.colPrice, styles.th]}>Price</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.colNo, styles.td]}>1</Text>
            <Text style={[styles.colItem, styles.td]}>{itemLabel}</Text>
            <Text style={[styles.colQty, styles.td]}>1</Text>
            <Text style={[styles.colTax, styles.td]}>0.00%</Text>
            <Text style={[styles.colTax, styles.td]}>9.00%</Text>
            <Text style={[styles.colTax, styles.td]}>9.00%</Text>
            <Text style={[styles.colPrice, styles.td]}>
              {formatRupees(gst.basePaise)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryBlock}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sub Total</Text>
            <Text style={styles.summaryValue}>
              {formatRupees(gst.basePaise)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IGST (0%)</Text>
            <Text style={styles.summaryValue}>
              {formatRupees(gst.igstPaise)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>SGST (9%)</Text>
            <Text style={styles.summaryValue}>
              {formatRupees(gst.sgstPaise)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>CGST (9%)</Text>
            <Text style={styles.summaryValue}>
              {formatRupees(gst.cgstPaise)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Tax</Text>
            <Text style={styles.summaryValue}>
              {formatRupees(totalTaxPaise)}
            </Text>
          </View>
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Payable Total</Text>
            <Text style={styles.summaryTotalValue}>
              {formatRupees(gst.totalPaise)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {data.type === "team"
              ? "Team roster — entry QR codes"
              : "Entry QR code"}
          </Text>
          {data.participants.map((p) => (
            <View key={p.uniqueId} style={styles.participantCard} wrap={false}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not next/image; no alt concept in PDF */}
              <Image src={p.qrDataUrl} style={styles.qr} />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.name}</Text>
                <Text style={styles.uniqueId}>{p.uniqueId}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Show this QR code at the venue for entry verification. Keep this
          receipt safe — it is your proof of registration.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return renderToBuffer(<ReceiptDocument data={data} />);
}
