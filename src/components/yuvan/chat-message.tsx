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
      <div key={callId} className="flex flex-col gap-2 mt-2 w-full max-w-[200px] animate-pulse">
        <div className="h-2 bg-foreground/10 rounded-full w-3/4"></div>
        <div className="h-2 bg-foreground/10 rounded-full w-1/2"></div>
        <div className="h-8 bg-foreground/10 rounded-md w-full mt-1"></div>
      </div>
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
    <details key={callId} className="mt-1 max-w-full text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none hover:text-foreground">
        View data looked up
      </summary>
      <pre className="mt-1.5 max-w-full overflow-x-auto rounded-md bg-muted/50 p-2 text-[0.7rem] leading-relaxed">
        {JSON.stringify(output, null, 2)}
      </pre>
    </details>
  );
}

export function ChatMessage({ message }: { message: UIMessage }) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}>
      <div
        className={
          message.role === "user"
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground shadow-sm transition-all duration-300"
            : "max-w-[90%] space-y-1.5 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm shadow-sm transition-all duration-300"
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
