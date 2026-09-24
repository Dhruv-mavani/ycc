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
      {open ? <AdminChatPanelBody /> : null}

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
