import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PartnerApplicationStatus,
  PartnerType,
  StaffStatus,
} from "@/lib/supabase/types";

export async function getStaffSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();

  if (!staff) return null;
  return { user, staff };
}

export async function requireStaff() {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");
  return session;
}

/**
 * Used by the /staff protected layout. Unlike getStaffSession (which only
 * recognizes approved staff), this also handles the first-ever sign-in: if
 * no staff row exists yet, one is created with status "pending" so it shows
 * up for an admin to review, instead of just failing silently.
 */
export async function getStaffAccessStatus(): Promise<
  | { state: "unauthenticated" }
  | {
      state: StaffStatus;
      user: { id: string; email?: string };
      staffName: string | null;
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "unauthenticated" };

  const { data: existing } = await supabase
    .from("staff")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { state: existing.status, user, staffName: existing.name };
  }

  // First-ever sign-in for this Google account — file a pending request.
  // `staff` has no public INSERT policy, so this goes through the
  // service-role client.
  const admin = createAdminClient();
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  const { data: created } = await admin
    .from("staff")
    .insert({
      user_id: user.id,
      email: user.email ?? "",
      name,
      status: "pending",
    })
    .select("*")
    .single();

  return { state: "pending", user, staffName: created?.name ?? name };
}

/**
 * Used by the /partner-program/status page. A partner's Supabase Auth
 * account is created up front at application time (unlike staff, there's
 * no self-service "first sign-in creates a pending row" step), so this
 * just looks up their existing application by user_id.
 */
export async function getPartnerAccessStatus(): Promise<
  | { state: "unauthenticated" }
  | { state: "no_application"; user: { id: string; email?: string } }
  | {
      state: PartnerApplicationStatus;
      user: { id: string; email?: string };
      application: { id: string; name: string; partnerType: PartnerType };
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "unauthenticated" };

  const { data: application } = await supabase
    .from("partner_program_applications")
    .select("id, name, partner_type, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!application) return { state: "no_application", user };

  return {
    state: application.status,
    user,
    application: {
      id: application.id,
      name: application.name,
      partnerType: application.partner_type,
    },
  };
}

/**
 * Used by the dedicated per-type dashboard pages (/campus-partner,
 * /class-partner, /classmate-partner). Redirects anyone who isn't an
 * approved partner of exactly this type back to the shared status page
 * (or the apply/login page if not signed in at all).
 */
export async function requirePartnerOfType(expectedType: PartnerType) {
  const access = await getPartnerAccessStatus();

  if (access.state === "unauthenticated") {
    redirect("/partner-program");
  }
  if (access.state === "no_application") {
    redirect("/partner-program/status");
  }
  if (access.state !== "approved" || access.application.partnerType !== expectedType) {
    redirect("/partner-program/status");
  }

  return access;
}

export async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) return null;
  return { user, admin };
}

/**
 * Used by the /admin protected layout. Unlike getAdminSession (which just
 * returns null for any non-admin), this distinguishes "never signed in" from
 * "signed in with a Google account that isn't in the admins table" so the
 * latter can show an explicit "not authorized" warning instead of silently
 * bouncing back to the login page. Admins are granted manually (no
 * self-service request flow like staff has), so there's no "pending" state.
 */
export async function getAdminAccessStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "unauthenticated" as const };

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) return { state: "unauthorized" as const, user };
  return { state: "authorized" as const, user, admin };
}

/** For API routes: no redirect, just tells you whether the caller may scan/verify. */
export async function getStaffOrAdminSession() {
  const staff = await getStaffSession();
  if (staff) return { role: "staff" as const, userId: staff.user.id };

  const admin = await getAdminSession();
  if (admin) return { role: "admin" as const, userId: admin.user.id };

  return null;
}
