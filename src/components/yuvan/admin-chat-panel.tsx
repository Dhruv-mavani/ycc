"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Deferred until an admin actually opens the panel — keeps the ai/
// @ai-sdk/react bundle out of the admin dashboard's initial JS payload,
// since this mounts on every admin page via the protected layout.
const AdminChatPanelBody = dynamic(
  () => import("./admin-chat-panel-body").then((m) => m.AdminChatPanelBody),
  { ssr: false },
);

export function AdminChatPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      <div
        className={`mb-4 transition-[transform,opacity] duration-300 origin-bottom-right ${
          open ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" : "scale-90 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <AdminChatPanelBody />
      </div>

      <div className="relative">
        <Button
          size="icon-lg"
          className="size-16 overflow-hidden rounded-full p-0 shadow-lg border-2 border-blue-500 bg-background"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close YUVAN insights" : "Ask YUVAN"}
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
