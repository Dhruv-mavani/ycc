import Link from "next/link";
import { getCollegeDetail } from "@/lib/admin-stats";
import { CollegeRegistrationsList } from "@/components/admin/college-registrations-list";
import { Button } from "@/components/ui/button";

export default async function CollegeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { id } = await params;
  const { event: eventId } = await searchParams;
  const { collegeName, registrations } = await getCollegeDetail(
    id,
    eventId || undefined,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={
          <Link href={`/admin${eventId ? `?event=${eventId}` : ""}`}>
            ← Back to overview
          </Link>
        }
      />
      <h1 className="text-xl font-bold">{collegeName}</h1>
      <p className="text-muted-foreground text-sm">
        {registrations.length} confirmed registration(s)
      </p>

      <CollegeRegistrationsList registrations={registrations} />
    </div>
  );
}
