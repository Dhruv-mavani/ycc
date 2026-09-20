import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { collegeCampusPartnerApplicationUpdateSchema } from "@/lib/validations/college-campus-partner";

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
  const parsed = collegeCampusPartnerApplicationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const admin = createAdminClient();

  const { data: application, error } = await admin
    .from("college_campus_partner_applications")
    .update({
      college_id: input.collegeId,
      stream: input.stream,
      year: input.year,
      semester: input.semester,
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      instagram_handle: input.instagramHandle,
      age: input.age,
      gender: input.gender,
      agreed_to_terms: input.agreedToTerms,
    })
    .eq("id", id)
    .select(
      "id, name, email, mobile, age, gender, instagram_handle, stream, year, semester, code, agreed_to_terms, college_id, created_at",
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
  const { error } = await admin
    .from("college_campus_partner_applications")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Could not delete College Campus Partner application" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
