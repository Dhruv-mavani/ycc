import { createAgentUIStreamResponse } from "ai";
import { getAdminSession } from "@/lib/auth";
import { adminAgent } from "@/lib/yuvan/admin-agent";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await request.json();

  return createAgentUIStreamResponse({
    agent: adminAgent,
    uiMessages: messages,
  });
}
