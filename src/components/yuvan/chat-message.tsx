"use client";

import {
  isTextUIPart,
  isToolUIPart,
  getToolName,
  type UIMessage,
  type ToolUIPart,
  type DynamicToolUIPart,
} from "ai";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function ToolPart({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const toolName = getToolName(part);
  const callId = part.toolCallId;

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <p key={callId} className="text-xs text-muted-foreground italic">
        Looking that up…
      </p>
    );
  }

  if (part.state === "output-error") {
    return (
      <p key={callId} className="text-xs text-destructive">
        Something went wrong looking that up.
      </p>
    );
  }

  if (part.state !== "output-available") return null;

  const output = part.output as Record<string, unknown> | undefined;

  if (toolName === "findMyRegistration") {
    if (output?.found && typeof output.downloadUrl === "string") {
      return (
        <Button
          key={callId}
          size="sm"
          variant="outline"
          nativeButton={false}
          className="mt-1"
          render={
            <a href={output.downloadUrl} target="_blank" rel="noreferrer">
              <Download className="size-3.5" />
              Download
            </a>
          }
        />
      );
    }
    return (
      <p key={callId} className="text-xs text-muted-foreground">
        {typeof output?.message === "string" ? output.message : "Couldn't find that."}
      </p>
    );
  }

  return (
    <pre key={callId} className="mt-1 max-w-full overflow-x-auto rounded-md bg-muted/50 p-2 text-[0.7rem] leading-relaxed">
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}

export function ChatMessage({ message }: { message: UIMessage }) {
  return (
    <div className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          message.role === "user"
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
            : "max-w-[90%] space-y-1.5 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
        }
      >
        {message.parts.map((part, i) => {
          if (isTextUIPart(part)) {
            return part.text ? (
              <p key={i} className="whitespace-pre-wrap">
                {part.text}
              </p>
            ) : null;
          }
          if (isToolUIPart(part)) {
            return <ToolPart key={i} part={part} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
