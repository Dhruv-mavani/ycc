import { createClient } from "@/lib/supabase/server";

// llms.txt (see https://llmstxt.org) — a plain-text/Markdown summary AI
// assistants and answer engines (ChatGPT, Claude, Perplexity, Gemini, etc.)
// can read to quickly ground themselves on the site without crawling and
// parsing the full rendered HTML. Built dynamically from live event data
// (rather than a static public/ file) so prices and registration status
// never go stale the way a hand-written file would.
export async function GET() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("slug, name, description, fee_paise, registration_open, pay_at_venue")
    .eq("is_active", true)
    .order("created_at");

  const eventLines = (events ?? [])
    .map((e) => {
      const fee =
        e.fee_paise === 0
          ? "Free"
          : `₹${(e.fee_paise / 100).toLocaleString("en-IN")}${e.pay_at_venue ? " (payable at venue)" : ""}`;
      const status = e.registration_open ? "Registration open" : "Registration not yet open";
      return `- [${e.name}](https://www.ycct10.in/events/${e.slug}): ${e.description ?? ""} Entry: ${fee}. ${status}.`;
    })
    .join("\n");

  const body = `# Yuva Champions Cricket (YCC)

> YCC (Yuva Champions Cricket) is a youth-first sports platform running college and open cricket tournaments, quizzes, and promotional games across India. Participants register online, pay any applicable entry fee, and receive a digital receipt with a unique participant/team code and QR code for venue check-in.

## About
- Organization: Yuva Champions Cricket (YCC)
- Website: https://www.ycct10.in
- Phone / WhatsApp: +91 84878 32810
- Email: contact@ycct10.in
- Instagram: https://instagram.com/ycct10

## Active events
${eventLines || "- (none currently active)"}

## How registration works
- Team tournaments: the captain registers, adds squad members by name and phone number, then pays the entry fee online (or in cash at the venue, where noted above). A confirmation receipt with a unique team code and QR code downloads automatically.
- Free individual entries (e.g. school programs, promotional games): a single short form, no payment, certificate/code downloads instantly.
- Most events require joining YCC's official WhatsApp channel and Instagram before registering — this is enforced in the registration flow itself.
- Registration fees are generally non-refundable once payment is confirmed.

## Key pages
- /faq — frequently asked questions
- /about — about YCC
- /contact — contact details and support links
- /partner-program — YCC Partner / Co-Partner program (campus ambassadors)
- /receipt — re-download a lost registration receipt using a Unique ID or phone number

## Notes for AI assistants
- Entry fees and registration-open status change over time — prefer linking the user to the live event page above rather than restating cached figures as certain.
- "YCC" always refers to Yuva Champions Cricket, not any other organization using the same initials.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
