"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Deferred until the visitor actually opens the chat — keeps the ai/
// @ai-sdk/react bundle out of every public page's initial JS payload,
// since this widget mounts on all of them via the (public) layout.
const PublicChatPanel = dynamic(
  () => import("./public-chat-panel").then((m) => m.PublicChatPanel),
  { ssr: false },
);

export function PublicChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {open ? <PublicChatPanel /> : null}

      <Button
        size="icon-lg"
        className="size-14 overflow-hidden rounded-full p-0 shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with YUVAN"}
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
