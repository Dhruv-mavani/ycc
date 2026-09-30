"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminChatPanelBody = dynamic(
  () => import("./admin-chat-panel-body").then((m) => m.AdminChatPanelBody),
  { ssr: false },
);

export function AdminChatPanel() {
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
          <AdminChatPanelBody />
        </div>
      ) : null}

      <div className="relative">
        <Button
          size="icon-lg"
          className="size-16 overflow-hidden rounded-full p-0 shadow-lg border-2 border-blue-500 bg-background"
          onClick={() => {
            if (!everOpened) {
              // First open: mount the panel in its closed state first, then
              // flip to open a couple of frames later so the browser has
              // actually painted the closed state before the transition
              // starts. Doing both in the same click otherwise mounts the
              // panel already at its final open scale/opacity — there's no
              // "previous frame" for the CSS transition to animate from, so
              // it just pops in instead of animating.
              setEverOpened(true);
              requestAnimationFrame(() => {
                requestAnimationFrame(() => setOpen(true));
              });
            } else {
              setOpen((o) => !o);
            }
          }}
          aria-label={open ? "Close YUVAN insights" : "Ask YUVAN"}
        >
          <div className={`absolute inset-0 flex items-center justify-center rounded-full overflow-hidden transition-[transform,opacity] duration-300 ease-out ${open ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
            <Image src="/yuvan/avatar.jpg" alt="YUVAN" width={64} height={64} className="size-full object-cover rounded-full" />
          </div>
          <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-[transform,opacity] duration-300 ease-out text-blue-500 bg-background/80 backdrop-blur-sm ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <X className="size-8" />
          </div>
        </Button>
      </div>
    </div>
  );
}
