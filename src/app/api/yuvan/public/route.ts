import { createAgentUIStreamResponse } from "ai";
import { isRateLimited } from "@/lib/rate-limit";
import { createPublicAgent } from "@/lib/yuvan/public-agent";
import { buildPublicSystemPrompt } from "@/lib/yuvan/public-knowledge";

function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(`yuvan-public-chat:${ip}`, { max: 20, windowMs: 5 * 60_000 })) {
    return new Response(
      JSON.stringify({ error: "Too many messages — please try again in a few minutes." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages } = await request.json();
  const knowledge = await buildPublicSystemPrompt();

  return createAgentUIStreamResponse({
    agent: createPublicAgent(ip, knowledge),
    uiMessages: messages,
  });
}
