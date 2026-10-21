import { tool } from "ai";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { findAnyRegistrationOrCertificate } from "@/lib/registration-lookup";

export function createFindRegistrationTool(ip: string) {
  return tool({
    description:
      "Look up a visitor's OWN confirmed registration, receipt, or certificate using the mobile/WhatsApp number they registered with, or their personalized code/unique ID. Searches every YCC registration flow (tournament, Partner Program, College Campus Partner, school, individual free). Only call this with a number/code the visitor themselves just provided in this conversation — never reuse one from elsewhere, never guess. When it returns found:true, do not restate or link the raw downloadUrl in your reply — the chat UI renders its own download button from this result — just confirm it was found in plain words.",
    inputSchema: z.object({
      query: z
        .string()
        .trim()
        .min(1)
        .describe("A 10-digit Indian mobile/WhatsApp number, or a personalized code/unique ID"),
    }),
    execute: async ({ query }) => {
      if (isRateLimited(`yuvan-lookup:${ip}`, { max: 8, windowMs: 60_000 })) {
        return {
          found: false as const,
          message: "Too many lookup attempts from this connection — please try again in a minute.",
        };
      }

      const result = await findAnyRegistrationOrCertificate(query);
      if (!result) {
        return {
          found: false as const,
          message: "No confirmed registration or certificate found for that number/code.",
        };
      }

      return { found: true as const, ...result };
    },
  });
}
