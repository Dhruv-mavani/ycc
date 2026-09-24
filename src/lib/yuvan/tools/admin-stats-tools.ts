import { tool, type ToolSet } from "ai";
import { z } from "zod";
import {
  getEventOverview,
  getCashCollectionOverview,
  getCashCollectionDetail,
  getRegistrationsOverTime,
  getPartnerSquadReadiness,
  getCollegeCampusPartnerOverview,
  getCollegeCampusPartnerInsights,
  getCollegeDetail,
  getGameInsights,
  getStaffDirectory,
} from "@/lib/admin-stats";

const dateRangeSchema = z
  .enum(["today", "7d", "30d", "all"])
  .optional()
  .describe("Time window to scope the stats to. Omit for all-time.");

// Smaller tool-calling models (this app uses gpt-4.1-mini on the AI
// Gateway's free tier) sometimes invent a placeholder/wildcard UUID for an
// optional id field instead of omitting it, even when explicitly told not
// to — silently turning "all events" into "an event that doesn't exist".
// Sanitizing obviously-fake ids (all zeros, all f's) back to undefined
// defends against that regardless of prompt wording or which model runs.
const FAKE_ID_RE = /^0{8}-0{4}-0{4}-0{4}-0{12}$|^f{8}-f{4}-f{4}-f{4}-f{12}$/i;
function sanitizeId(id: string | undefined): string | undefined {
  return id && !FAKE_ID_RE.test(id) ? id : undefined;
}

/**
 * Thin `tool()` wrappers around the already-tested admin-stats.ts
 * functions — no new Supabase queries. Amounts everywhere are in paise
 * (1/100 of a rupee); convert to ₹ when summarizing for the admin.
 */
export const adminTools = {
  eventOverview: tool({
    description:
      "Get registration counts, revenue (paise), and attendance — across ALL events combined by default, or scoped to one event and/or a recent date range. To get totals across all events, omit eventId entirely — do NOT invent a placeholder/wildcard UUID, that will incorrectly return zero for everything. The response's `events` list (id, name, type) is the way to resolve an event's name to its real id for other tools; `byCollege` (collegeId, collegeName, ...) is the way to resolve a college's name to its id for collegeDetail.",
    inputSchema: z.object({
      eventId: z
        .string()
        .uuid()
        .optional()
        .describe(
          "Only pass this to scope to ONE specific event, using a real id from a prior eventOverview call's `events` list. Omit this field entirely for all-events totals.",
        ),
      range: dateRangeSchema,
    }),
    execute: async ({ eventId, range }) => getEventOverview(sanitizeId(eventId), range),
  }),

  cashCollectionOverview: tool({
    description:
      "Per-event breakdown of cash owed vs. actually collected at the venue, for pay-at-venue events only. Shows confirmed/paid/pending registration counts and amounts (paise).",
    inputSchema: z.object({}),
    execute: async () => getCashCollectionOverview(),
  }),

  cashCollectionDetail: tool({
    description:
      "Per-registration detail (who, contact info, whether cash was collected and by whom) for every pay-at-venue registration. Optionally filter by a search string matching team/captain/college/participant name, phone, or unique ID.",
    inputSchema: z.object({
      search: z.string().optional(),
    }),
    execute: async ({ search }) => getCashCollectionDetail(search),
  }),

  registrationsOverTime: tool({
    description:
      "Daily confirmed-registration counts for a trend chart, across all events by default or scoped to one event. Useful for questions like 'how has registration been trending'.",
    inputSchema: z.object({
      eventId: z
        .string()
        .uuid()
        .optional()
        .describe("Only pass this to scope to ONE specific real event id. Omit entirely for all-events totals — never invent a placeholder id."),
      range: dateRangeSchema,
    }),
    execute: async ({ eventId, range }) => getRegistrationsOverTime(sanitizeId(eventId), range),
  }),

  partnerSquadReadiness: tool({
    description:
      "Per-YCC-Partner/Co-Partner rollup: people directly recruited (split Co-Partners vs Squad), teams actually registered and paid for, and revenue (paise). Covers the referral-based Partner Program only, not College Campus Partners.",
    inputSchema: z.object({}),
    execute: async () => getPartnerSquadReadiness(),
  }),

  collegeCampusPartnerOverview: tool({
    description:
      "Flat list of every YCC College Campus Partner (name, college, stream, year/semester, code). Use this to resolve a College Campus Partner's name to their id before calling collegeCampusPartnerInsights.",
    inputSchema: z.object({}),
    execute: async () => getCollegeCampusPartnerOverview(),
  }),

  collegeCampusPartnerInsights: tool({
    description:
      "For one College Campus Partner (by id — resolve via collegeCampusPartnerOverview first): how many teams and people registered for Kismat Ke Khiladi ft. Go Goa Gone using their code, and how many of those teams converted (also registered) to the Box Cricket League.",
    inputSchema: z.object({
      partnerId: z.string().uuid(),
    }),
    execute: async ({ partnerId }) => getCollegeCampusPartnerInsights(partnerId),
  }),

  collegeDetail: tool({
    description:
      "Full registration + participant + attendance detail for one college (by id — resolve via eventOverview's `byCollege` list first), optionally scoped to one event.",
    inputSchema: z.object({
      collegeId: z.string().uuid(),
      eventId: z.string().uuid().optional(),
    }),
    execute: async ({ collegeId, eventId }) => getCollegeDetail(collegeId, sanitizeId(eventId)),
  }),

  gameInsights: tool({
    description:
      "Promo game stats (Spin the Wheel, Mystery Box, Roll a Dice / Level Up) — play counts, wins/losses, and recent plays. Optionally filter by gameSlug ('level-up' combines Spin the Wheel + Roll a Dice into one run), a player/team search string, or won/lost result.",
    inputSchema: z.object({
      gameSlug: z.string().optional(),
      search: z.string().optional(),
      result: z.enum(["won", "lost"]).optional(),
    }),
    execute: async ({ gameSlug, search, result }) => getGameInsights(gameSlug, search, result),
  }),

  staffDirectory: tool({
    description:
      "List every admin and staff account with dashboard/scanning-booth access — names, emails, role (admin or staff), and status (admins are always 'active'; staff can be 'pending', 'approved', or 'rejected').",
    inputSchema: z.object({}),
    execute: async () => getStaffDirectory(),
  }),
} satisfies ToolSet;
