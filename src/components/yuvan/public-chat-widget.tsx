"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PublicChatPanel = dynamic(
  () => import("./public-chat-panel").then((m) => m.PublicChatPanel),
  { ssr: false },
);

export function PublicChatWidget() {
  const [open, setOpen] = useState(false);
  // The panel (and the AI SDK bundle behind it) is only mounted once the
  // visitor first opens the chat. Mounting it at page load grew this fixed
  // container after hydration, which Lighthouse counted as a layout shift,
  // and shipped ~100KB of unused JS on every page.
  const [everOpened, setEverOpened] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {everOpened ? (
        <div
          className={`absolute bottom-full right-0 mb-4 origin-bottom-right transition-[transform,opacity] duration-300 ${
            open
              ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
              : "scale-90 opacity-0 translate-y-4 pointer-events-none"
          }`}
          aria-hidden={!open}
        >
          <PublicChatPanel />
        </div>
      ) : null}

      <div className="relative">
        <Button
          size="icon-lg"
          className="size-16 overflow-hidden rounded-full p-0 shadow-lg border-2 border-blue-500 bg-background"
          onClick={() => {
            setEverOpened(true);
            setOpen((o) => !o);
          }}
          aria-label={open ? "Close chat" : "Chat with YUVAN"}
        >
          <div className={`absolute inset-0 flex items-center justify-center rounded-full overflow-hidden transition-[transform,opacity] duration-500 ${open ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
            <Image src="/yuvan/avatar.jpg" alt="YUVAN" width={64} height={64} className="size-full object-cover rounded-full" />
          </div>
          <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-[transform,opacity] duration-500 text-blue-500 bg-background/80 backdrop-blur-sm ${open ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
            <X className="size-8" />
          </div>
        </Button>
      </div>
    </div>
  );
}
