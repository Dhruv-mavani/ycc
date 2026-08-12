import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerProgramApplicationUpdateSchema } from "@/lib/validations/partner-program";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ id }, body] = await Promise.all([
    params,
    request.json().catch(() => null),
  ]);
  const parsed = partnerProgramApplicationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: application, error } = await admin
    .from("partner_program_applications")
    .update({
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      instagram_handle: input.instagramHandle,
      referred_by: input.referredBy || null,
      agreed_to_terms: input.agreedToTerms,
    })
    .eq("id", id)
    .select(
      "id, name, email, mobile, instagram_handle, referred_by, agreed_to_terms, partner_type, status, created_at",
    )
    .single();

  if (error || !application) {
    return NextResponse.json(
      { error: "Could not update application" },
      { status: 500 },
    );
  }

  return NextResponse.json({ application });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("partner_program_applications").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Could not delete partner program application" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
