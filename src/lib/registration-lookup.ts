import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const MOBILE_RE = /^[6-9]\d{9}$/;

/**
 * Shared query logic behind every public "find my registration/certificate"
 * lookup route. Each route keeps its own request parsing/validation (field
 * names and zod schemas differ per flow) and only delegates the actual
 * Supabase lookup here, so there's one place to fix if the matching logic
 * ever changes.
 */

export async function lookupReceiptRegistration(
  query: string,
): Promise<{ registrationId: string } | null> {
  const admin = createAdminClient();

  const { data: participant } = await admin
    .from("participants")
    .select("registration_id")
    .eq("unique_id", query.toUpperCase())
    .maybeSingle();

  if (participant) {
    const { data: registration } = await admin
      .from("registrations")
      .select("id")
      .eq("id", participant.registration_id)
      .eq("status", "confirmed")
      .maybeSingle();
    if (registration) return { registrationId: registration.id };
  }

  if (MOBILE_RE.test(query)) {
    const { data: registration } = await admin
      .from("registrations")
      .select("id")
      .eq("captain_phone", query)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (registration) return { registrationId: registration.id };
  }

  return null;
}

export async function lookupPartnerProgramCertificate(
  mobile: string,
): Promise<{ applicationId: string } | null> {
  const admin = createAdminClient();
  const { data: application } = await admin
    .from("partner_program_applications")
    .select("id")
    .eq("mobile", mobile)
    .in("partner_type", ["campus", "class", "classmate"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return application ? { applicationId: application.id } : null;
}

export async function lookupCollegeCampusPartnerCertificate(
  query: string,
): Promise<{ applicationId: string } | null> {
  const admin = createAdminClient();

  const { data: byCode } = await admin
    .from("college_campus_partner_applications")
    .select("id")
    .eq("code", query.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (byCode) return { applicationId: byCode.id };

  if (MOBILE_RE.test(query)) {
    const { data: byMobile } = await admin
      .from("college_campus_partner_applications")
      .select("id")
      .eq("mobile", query)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byMobile) return { applicationId: byMobile.id };
  }

  return null;
}

export async function lookupSchoolCertificate(
  query: string,
): Promise<{ registrationId: string } | null> {
  const admin = createAdminClient();

  const { data: byCode } = await admin
    .from("school_tournament_registrations")
    .select("id")
    .eq("code", query.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (byCode) return { registrationId: byCode.id };

  if (MOBILE_RE.test(query)) {
    const { data: byPhone } = await admin
      .from("school_tournament_registrations")
      .select("id")
      .eq("whatsapp", query)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byPhone) return { registrationId: byPhone.id };
  }

  return null;
}

export async function lookupIndividualFreeCertificate(
  query: string,
): Promise<{ registrationId: string } | null> {
  const admin = createAdminClient();

  const { data: byCode } = await admin
    .from("individual_free_registrations")
    .select("id")
    .eq("code", query.toUpperCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (byCode) return { registrationId: byCode.id };

  if (MOBILE_RE.test(query)) {
    const { data: byPhone } = await admin
      .from("individual_free_registrations")
      .select("id")
      .eq("whatsapp", query)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byPhone) return { registrationId: byPhone.id };
  }

  return null;
}

export type LookupFlow =
  | "tournament-receipt"
  | "partner-program-certificate"
  | "college-campus-partner-certificate"
  | "school-certificate"
  | "individual-free-certificate";

export interface FoundLookup {
  flow: LookupFlow;
  id: string;
  downloadUrl: string;
}

/**
 * Tries every registration/certificate flow in turn — a chat visitor won't
 * know which form they filled out, unlike someone landing on a
 * flow-specific lookup page. Used by YUVAN's public findMyRegistration
 * tool.
 */
export async function findAnyRegistrationOrCertificate(
  query: string,
): Promise<FoundLookup | null> {
  const trimmed = query.trim();

  const receipt = await lookupReceiptRegistration(trimmed);
  if (receipt) {
    return {
      flow: "tournament-receipt",
      id: receipt.registrationId,
      downloadUrl: `/api/registrations/${receipt.registrationId}/receipt?view=true`,
    };
  }

  if (MOBILE_RE.test(trimmed)) {
    const partner = await lookupPartnerProgramCertificate(trimmed);
    if (partner) {
      return {
        flow: "partner-program-certificate",
        id: partner.applicationId,
        downloadUrl: `/api/partner-program/certificate/${partner.applicationId}/download?view=true`,
      };
    }
  }

  const ccp = await lookupCollegeCampusPartnerCertificate(trimmed);
  if (ccp) {
    return {
      flow: "college-campus-partner-certificate",
      id: ccp.applicationId,
      downloadUrl: `/api/college-campus-partner/certificate/${ccp.applicationId}/download?view=true`,
    };
  }

  const school = await lookupSchoolCertificate(trimmed);
  if (school) {
    return {
      flow: "school-certificate",
      id: school.registrationId,
      downloadUrl: `/api/school-registrations/${school.registrationId}/certificate?view=true`,
    };
  }

  const indiv = await lookupIndividualFreeCertificate(trimmed);
  if (indiv) {
    return {
      flow: "individual-free-certificate",
      id: indiv.registrationId,
      downloadUrl: `/api/individual-free-registrations/${indiv.registrationId}/certificate?view=true`,
    };
  }

  return null;
}
