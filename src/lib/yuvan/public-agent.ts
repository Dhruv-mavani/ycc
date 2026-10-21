import { ToolLoopAgent, stepCountIs } from "ai";
import { createFindRegistrationTool } from "./tools/find-registration-tool";

// Anthropic models on the AI Gateway require a paid credit top-up even
// with a card on file — gpt-4.1-mini is available on the free tier and
// verified live to support reliable tool calling.
export function createPublicAgent(ip: string, knowledge: string) {
  return new ToolLoopAgent({
    model: "openai/gpt-4.1-mini",
    instructions: knowledge,
    tools: {
      findMyRegistration: createFindRegistrationTool(ip),
    },
    stopWhen: stepCountIs(4),
  });
}
