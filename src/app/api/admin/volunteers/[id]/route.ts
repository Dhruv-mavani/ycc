import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { volunteerApplicationSchema } from "@/lib/validations/volunteer";

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
  const parsed = volunteerApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: college } = await admin
    .from("colleges")
    .select("id")
    .eq("id", input.collegeId)
    .maybeSingle();

  if (!college) {
    return NextResponse.json({ error: "Select a valid college" }, { status: 400 });
  }

  const { data: application, error } = await admin
    .from("volunteer_applications")
    .update({
      name: input.name,
      email: input.email,
      college_id: college.id,
      stream: input.stream,
      semester: input.semester,
      mobile: input.mobile,
      instagram_handle: input.instagramHandle,
      referred_by: input.referredBy || null,
      agreement_q1: input.agreementQ1,
      agreement_q2: input.agreementQ2,
      agreement_q3: input.agreementQ3,
    })
    .eq("id", id)
    .select("*")
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
  const { error } = await admin.from("volunteer_applications").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Could not delete volunteer application" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
