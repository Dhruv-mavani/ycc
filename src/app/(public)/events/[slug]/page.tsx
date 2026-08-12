import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/site/back-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, supabase] = await Promise.all([params, createClient()]);
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      
      {(event.type === "quiz" || event.slug.includes("quiz")) && (
        <div className="mb-6 w-full overflow-hidden rounded-xl shadow-md">
          <Image
            src="/ycc_quiz_banner.png"
            alt={`${event.name} Banner`}
            width={800}
            height={400}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      )}
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {event.type}
        </Badge>
      </div>
      <h1 className="text-2xl font-bold">{event.name}</h1>
      <p className="text-muted-foreground mt-2 text-sm">{event.description}</p>

      <div className="mt-6 space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Entry fee: </span>
          <span className="font-semibold">{formatRupees(event.fee_paise)}</span>
          {event.type === "cricket" ? " per team" : " per person"}
          <span className="text-muted-foreground"> + 18% GST</span>
        </p>
        {event.type === "cricket" && event.min_team_size && event.max_team_size ? (
          <p>
            <span className="text-muted-foreground">Squad size: </span>
            <span className="font-semibold">
              {event.min_team_size === event.max_team_size
                ? `Exactly ${event.min_team_size}`
                : `${event.min_team_size}–${event.max_team_size}`}{" "}
              players
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-4 rounded-lg border p-3">
        <GstBreakdown basePaise={event.fee_paise} />
      </div>

      {event.rules ? (
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-semibold">Rules</h2>
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {event.rules}
          </p>
        </div>
      ) : null}

      {event.is_partner_only ? (
        <div className="mt-8 space-y-3 rounded-lg border border-dashed p-4 text-sm">
          <p className="text-muted-foreground">
            Registration for this event is exclusively through the YCC
            Partner Program — a YCC Co-Partner registers their own team
            (themselves + 5 approved Classmate Partners). To join a team,
            ask your YCC Co-Partner for their team code and apply as a
            Classmate Partner.
          </p>
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href="/partner-program">Go to Partner Program</Link>}
          />
        </div>
      ) : (
        <Button
          className="mt-8 w-full"
          nativeButton={false}
          render={<Link href={`/register/${event.slug}`}>Register now</Link>}
        />
      )}
    </div>
  );
}
