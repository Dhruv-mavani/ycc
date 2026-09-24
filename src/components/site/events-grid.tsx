import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// Fetched inside its own Suspense boundary so the homepage hero (and every
// other static section) streams in the first HTML chunk instead of waiting
// on this query — the headline was the LCP element and sat behind the
// loading spinner until the events query resolved.
export async function EventsGrid() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    // YCC Super Champs (and any future "school" type event) is free,
    // solo, no-payment — it lives in the footer's "Super Champs" link
    // and its own /events/[slug] page, not in this paid-events grid.
    .neq("type", "school")
    .order("created_at");

  return (
    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 min-[380px]:gap-5 sm:gap-8 max-w-5xl mx-auto">
      {(!events || events.length === 0) && (
        <div className="min-[380px]:col-span-2 rounded-3xl border border-dashed border-blue-200 p-16 text-center bg-white/50 backdrop-blur-md">
          <p className="text-slate-500 text-xl font-medium">
            No events are open for registration right now. Check back soon!
          </p>
        </div>
      )}
      {events?.map((event) =>
        event.registration_open ? (
          <Card key={event.id} className="relative overflow-hidden flex flex-col group hover:border-blue-400/50 transition-colors bg-white shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] border-blue-100 rounded-3xl">
            <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <CardTitle className="text-lg sm:text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors break-words">{event.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap w-fit bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <span className="relative flex h-1.5 w-1.5 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Open Now
                </Badge>
              </div>
              <CardDescription className="text-xs sm:text-base mt-2 sm:mt-3 text-slate-600 leading-relaxed break-words">{event.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-5 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8 mt-auto border-t border-slate-100 bg-slate-50">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all font-semibold rounded-xl h-11 sm:h-12 text-sm sm:text-lg px-2"
                nativeButton={false}
                render={
                  <Link href={`/events/${event.slug}`} className="flex items-center justify-center w-full">
                    {event.fee_paise === 0 ? "Register for free" : `Entry Fee: ${formatRupees(event.fee_paise)}`}
                  </Link>
                }
              />
            </CardFooter>
          </Card>
        ) : (
          <Card key={event.id} className="overflow-hidden border-dashed border-slate-200 bg-white/60 flex flex-col opacity-80 hover:opacity-100 transition-opacity rounded-3xl shadow-sm">
            <CardHeader className="pb-4 pt-6 sm:pt-8 px-4 sm:px-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <CardTitle className="text-lg sm:text-2xl font-bold text-slate-500 break-words">{event.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap w-fit bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs"
                >
                  Coming Soon
                </Badge>
              </div>
              <CardDescription className="text-xs sm:text-base mt-2 sm:mt-3 text-slate-500 leading-relaxed break-words">{event.description}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-5 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-8 mt-auto border-t border-slate-100 bg-slate-50/50">
              <Button
                disabled
                variant="outline"
                className="w-full border-slate-200 text-slate-400 bg-transparent rounded-xl h-11 sm:h-12 text-sm sm:text-lg font-semibold px-2"
              >
                {event.fee_paise === 0 ? "Register for free" : `Entry Fee: ${formatRupees(event.fee_paise)}`}
              </Button>
            </CardFooter>
          </Card>
        ),
      )}
    </div>
  );
}

export function EventsGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 min-[380px]:gap-5 sm:gap-8 max-w-5xl mx-auto"
      aria-hidden="true"
    >
      {[0, 1].map((i) => (
        <div key={i} className="min-h-[300px] animate-pulse rounded-2xl border border-slate-200 bg-white/70" />
      ))}
    </div>
  );
}
