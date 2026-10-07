import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { markCashPaymentPaid } from "@/lib/pay-at-venue-payment";

type AdminClient = ReturnType<typeof createAdminClient>;

// Hardcoded on purpose — this whole flow (public payment-link page, lookup,
// submission, admin review) is scoped to exactly this one event by design,
// not a generic "online payment for any event" system. See the
// conversation this was built from for the full security reasoning: a
// screenshot is never trusted on its own, every submission stays "pending"
// until an admin manually cross-checks the transaction id/amount against
// the real bank statement and clicks Verify — that one click is what
// flips the registration "paid" everywhere else (receipts, the staff
// Collect Payments cash toggle), reusing the exact same `payments` table
// every other payment path already writes to.
export const BOX_CRICKET_EVENT_SLUG = "cricket-championship-2026";

export const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024; // 4MB — well under Vercel's 4.5MB function body cap
const ALLOWED_SCREENSHOT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface TeamLookupResult {
  registrationId: string;
  teamName: string | null;
  captainName: string | null;
  amountPaise: number;
  /** Already confirmed paid (cash, Cashfree, or a previously-verified screenshot). */
  paid: boolean;
  /** A submission from this team is sitting in the review queue. */
  pendingReview: boolean;
  /** Most recent submission was rejected — they can resubmit. */
  rejected: boolean;
  rejectionReason: string | null;
}

async function getBoxCricketEventId(admin: AdminClient): Promise<string | null> {
  const { data } = await admin
    .from("events")
    .select("id")
    .eq("slug", BOX_CRICKET_EVENT_SLUG)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Exact-match only, by design — no fuzzy/partial search here. This page is
 * public and unauthenticated, so a typeahead that reveals OTHER teams'
 * names as someone types a few characters would leak registration data to
 * anyone poking around. A captain already knows their own full unique ID
 * (it's on their ID card/certificate), so requiring the exact code costs
 * them nothing while closing that enumeration path.
 */
export async function lookupBoxCricketTeam(
  code: string,
): Promise<TeamLookupResult | null> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;

  const admin = createAdminClient();
  const eventId = await getBoxCricketEventId(admin);
  if (!eventId) return null;

  const { data: participant } = await admin
    .from("participants")
    .select("registration_id")
    .eq("unique_id", trimmed)
    .maybeSingle();
  if (!participant) return null;

  const { data: registration } = await admin
    .from("registrations")
    .select("id, team_name, captain_name, amount_paise, event_id, status")
    .eq("id", participant.registration_id)
    .eq("event_id", eventId)
    .eq("status", "confirmed")
    .maybeSingle();
  if (!registration) return null;

  const [{ data: paidPayment }, { data: submissions }] = await Promise.all([
    admin
      .from("payments")
      .select("id")
      .eq("registration_id", registration.id)
      .eq("status", "paid")
      .maybeSingle(),
    admin
      .from("box_cricket_payment_submissions")
      .select("status, rejection_reason")
      .eq("registration_id", registration.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const latestSubmission = submissions?.[0] ?? null;

  return {
    registrationId: registration.id,
    teamName: registration.team_name,
    captainName: registration.captain_name,
    amountPaise: registration.amount_paise,
    paid: !!paidPayment,
    pendingReview: latestSubmission?.status === "pending",
    rejected: latestSubmission?.status === "rejected",
    rejectionReason: latestSubmission?.rejection_reason ?? null,
  };
}

export class PaymentSubmissionError extends Error {}

/**
 * Stores the screenshot in the private payment-screenshots bucket and
 * records a "pending" submission row — never touches the `payments` table
 * itself. Only verifyBoxCricketPayment (admin-only) does that.
 */
export async function submitBoxCricketPayment(input: {
  registrationId: string;
  transactionId: string;
  screenshot: File;
}): Promise<void> {
  const { registrationId, transactionId, screenshot } = input;

  if (!ALLOWED_SCREENSHOT_TYPES.has(screenshot.type)) {
    throw new PaymentSubmissionError("Screenshot must be a JPEG, PNG, or WebP image");
  }
  if (screenshot.size > MAX_SCREENSHOT_BYTES) {
    throw new PaymentSubmissionError("Screenshot is too large (max 4MB) — try a smaller screenshot");
  }
  if (!transactionId.trim()) {
    throw new PaymentSubmissionError("Transaction ID is required");
  }

  const admin = createAdminClient();

  const eventId = await getBoxCricketEventId(admin);
  const { data: registration } = await admin
    .from("registrations")
    .select("id, event_id, status")
    .eq("id", registrationId)
    .maybeSingle();
  if (!registration || registration.event_id !== eventId || registration.status !== "confirmed") {
    throw new PaymentSubmissionError("Registration not found");
  }

  const { data: existingPaid } = await admin
    .from("payments")
    .select("id")
    .eq("registration_id", registrationId)
    .eq("status", "paid")
    .maybeSingle();
  if (existingPaid) {
    throw new PaymentSubmissionError("This team is already marked as paid");
  }

  const { data: existingPending } = await admin
    .from("box_cricket_payment_submissions")
    .select("id")
    .eq("registration_id", registrationId)
    .eq("status", "pending")
    .maybeSingle();
  if (existingPending) {
    throw new PaymentSubmissionError("A submission for this team is already pending review");
  }

  const ext = screenshot.type === "image/png" ? "png" : screenshot.type === "image/webp" ? "webp" : "jpg";
  const path = `${registrationId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("payment-screenshots")
    .upload(path, screenshot, { contentType: screenshot.type, upsert: false });
  if (uploadError) {
    throw new PaymentSubmissionError("Could not upload screenshot — please try again");
  }

  const { error: insertError } = await admin
    .from("box_cricket_payment_submissions")
    .insert({
      registration_id: registrationId,
      transaction_id: transactionId.trim(),
      screenshot_path: path,
      status: "pending",
    });

  if (insertError) {
    // Clean up the orphaned file on failed insert — most likely cause is
    // the unique-transaction-id constraint (already submitted elsewhere).
    await admin.storage.from("payment-screenshots").remove([path]);
    if (insertError.code === "23505") {
      throw new PaymentSubmissionError(
        "This transaction ID has already been submitted for another team — contact YCC if this is a mistake",
      );
    }
    throw new PaymentSubmissionError("Could not record submission — please try again");
  }
}

export interface PaymentSubmissionRow {
  id: string;
  registrationId: string;
  teamName: string | null;
  captainName: string | null;
  amountPaise: number;
  transactionId: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export async function listBoxCricketPaymentSubmissions(
  status: "pending" | "verified" | "rejected" | "all" = "pending",
): Promise<PaymentSubmissionRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("box_cricket_payment_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);

  const { data: submissions } = await query;
  if (!submissions || submissions.length === 0) return [];

  const registrationIds = [...new Set(submissions.map((s) => s.registration_id))];
  const { data: registrations } = await admin
    .from("registrations")
    .select("id, team_name, captain_name, amount_paise")
    .in("id", registrationIds);
  const regById = new Map((registrations ?? []).map((r) => [r.id, r]));

  return submissions.map((s) => {
    const reg = regById.get(s.registration_id);
    return {
      id: s.id,
      registrationId: s.registration_id,
      teamName: reg?.team_name ?? null,
      captainName: reg?.captain_name ?? null,
      amountPaise: reg?.amount_paise ?? 0,
      transactionId: s.transaction_id,
      status: s.status as "pending" | "verified" | "rejected",
      rejectionReason: s.rejection_reason,
      createdAt: s.created_at,
      reviewedAt: s.reviewed_at,
    };
  });
}

/** Streams the screenshot bytes through the server — never a public/signed
 * URL handed to the browser, so access control is re-checked on every
 * single view, not just at link-generation time. */
export async function getBoxCricketPaymentScreenshot(
  submissionId: string,
): Promise<{ data: Blob; contentType: string } | null> {
  const admin = createAdminClient();
  const { data: submission } = await admin
    .from("box_cricket_payment_submissions")
    .select("screenshot_path")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) return null;

  const { data, error } = await admin.storage
    .from("payment-screenshots")
    .download(submission.screenshot_path);
  if (error || !data) return null;

  const ext = submission.screenshot_path.split(".").pop();
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { data, contentType };
}

export async function verifyBoxCricketPayment(
  submissionId: string,
  adminUserId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data: submission } = await admin
    .from("box_cricket_payment_submissions")
    .select("registration_id, status")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "pending") throw new Error("Submission already reviewed");

  // Same payments-table write every other payment path uses — this is
  // what actually flips the registration to "paid" everywhere (receipts,
  // staff Collect Payments). The only difference from cash is the
  // raw_payload method marker.
  await markCashPaymentPaid(admin, submission.registration_id, adminUserId);
  // markCashPaymentPaid writes method:"cash" — overwrite with the real method.
  await admin
    .from("payments")
    .update({
      raw_payload: {
        method: "upi_screenshot",
        verified_by: adminUserId,
        verified_at: new Date().toISOString(),
        submission_id: submissionId,
      },
    })
    .eq("registration_id", submission.registration_id)
    .eq("status", "paid");

  await admin
    .from("box_cricket_payment_submissions")
    .update({
      status: "verified",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);
}

// --- Bank statements ---------------------------------------------------
// A plain upload log for the admin's own manual cross-referencing while
// reviewing submissions above. Deliberately NOT parsed or auto-matched —
// that's exactly the kind of "trust the computer" shortcut this whole
// flow is built to avoid. Private bucket, admin-only.

const MAX_STATEMENT_BYTES = 10 * 1024 * 1024; // 10MB — PDFs run bigger than screenshots
const ALLOWED_STATEMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
]);

export interface BankStatementUpload {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export async function uploadBankStatement(file: File, adminUserId: string): Promise<void> {
  if (!ALLOWED_STATEMENT_TYPES.has(file.type)) {
    throw new PaymentSubmissionError("Statement must be a PDF, CSV, JPEG, or PNG file");
  }
  if (file.size > MAX_STATEMENT_BYTES) {
    throw new PaymentSubmissionError("File is too large (max 10MB)");
  }

  const admin = createAdminClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await admin.storage
    .from("bank-statements")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    throw new PaymentSubmissionError("Could not upload file — please try again");
  }

  const { error: insertError } = await admin.from("bank_statement_uploads").insert({
    file_path: path,
    file_name: file.name,
    uploaded_by: adminUserId,
  });
  if (insertError) {
    await admin.storage.from("bank-statements").remove([path]);
    throw new PaymentSubmissionError("Could not record upload — please try again");
  }
}

export async function listBankStatements(): Promise<BankStatementUpload[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("bank_statement_uploads")
    .select("*")
    .order("uploaded_at", { ascending: false });
  return (data ?? []).map((d) => ({
    id: d.id,
    fileName: d.file_name,
    filePath: d.file_path,
    uploadedAt: d.uploaded_at,
  }));
}

export async function getBankStatementFile(
  statementId: string,
): Promise<{ data: Blob; contentType: string; fileName: string } | null> {
  const admin = createAdminClient();
  const { data: statement } = await admin
    .from("bank_statement_uploads")
    .select("file_path, file_name")
    .eq("id", statementId)
    .maybeSingle();
  if (!statement) return null;

  const { data, error } = await admin.storage
    .from("bank-statements")
    .download(statement.file_path);
  if (error || !data) return null;

  return { data, contentType: data.type || "application/octet-stream", fileName: statement.file_name };
}

export async function deleteBankStatement(statementId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: statement } = await admin
    .from("bank_statement_uploads")
    .select("file_path")
    .eq("id", statementId)
    .maybeSingle();
  if (!statement) return;

  await admin.storage.from("bank-statements").remove([statement.file_path]);
  await admin.from("bank_statement_uploads").delete().eq("id", statementId);
}

export async function rejectBoxCricketPayment(
  submissionId: string,
  adminUserId: string,
  reason: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("box_cricket_payment_submissions")
    .update({
      status: "rejected",
      rejection_reason: reason.trim() || "Could not verify payment",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .eq("status", "pending");
  if (error) throw error;
}
