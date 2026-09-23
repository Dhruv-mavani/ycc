"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "./chat-message";

export function AdminChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/yuvan/admin" }),
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input.trim() });
      setInput("");
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {open ? (
        <Card className="mb-3 flex h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden p-0 shadow-2xl ring-1 ring-foreground/10">
          <div className="flex shrink-0 items-center gap-2.5 border-b border-border/50 px-4 py-3">
            <Image
              src="/yuvan/avatar.jpg"
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border/50"
            />
            <div>
              <p className="text-sm font-semibold">YUVAN — Insights</p>
              <p className="text-xs text-muted-foreground">
                Ask about registrations, revenue, partners, or game stats
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Try: &ldquo;How many teams registered for Box Cricket?&rdquo;
                or &ldquo;What&apos;s our cash collection status?&rdquo;
              </p>
            ) : (
              messages.map((m) => <ChatMessage key={m.id} message={m} />)
            )}
            {status === "submitted" || status === "streaming" ? (
              <p className="text-xs text-muted-foreground">YUVAN is thinking…</p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">
                Something went wrong — please try again.
              </p>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t border-border/50 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== "ready"}
              placeholder="Ask about your dashboard data…"
              className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={status !== "ready" || !input.trim()}
              aria-label="Send"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      ) : null}

      <Button
        size="icon-lg"
        className="size-14 overflow-hidden rounded-full p-0 shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close YUVAN insights" : "Ask YUVAN"}
      >
        {open ? (
          <X className="size-5" />
        ) : (
          <Image src="/yuvan/avatar.jpg" alt="" width={56} height={56} className="size-full object-cover" />
        )}
      </Button>
    </div>
  );
}
