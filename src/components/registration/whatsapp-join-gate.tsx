"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { PartnerHeader } from "@/components/registration/partner-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbARGeL7j6g6nUDmly3y";

// Shown instead of the real dashboard until a partner confirms they've
// followed the WhatsApp channel — compulsory for all three partner tiers.
// We can't verify the follow itself, so this is self-attested: the
// continue button stays disabled until they've clicked through to
// WhatsApp at least once.
export function WhatsappJoinGate({
  title,
  partnerName,
}: {
  title: string;
  partnerName: string;
}) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      const res = await fetch("/api/partner-program/whatsapp-join", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      toast.error("Could not confirm — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PartnerHeader title={title} partnerName={partnerName} />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>One last step</CardTitle>
            <CardDescription>
              Join the YCC Partners community to unlock your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Follow the YCC Partners Group channel on WhatsApp for updates,
              coordination, and announcements — then come back here and
              continue.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            {/* h-auto + whitespace-normal: the base Button is a fixed-height,
                nowrap control, which clips/overflows once a label wraps —
                these need to be able to grow to 2 lines on very narrow
                screens (down to 280px) without cutting text off. */}
            <Button
              className="h-auto w-full min-h-8 py-2 text-center leading-snug whitespace-normal"
              nativeButton={false}
              onClick={() => setOpened(true)}
              render={
                <a
                  href={WHATSAPP_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4 shrink-0" />
                  Follow on WhatsApp
                </a>
              }
            />
            <Button
              className="h-auto w-full min-h-8 py-2 text-center leading-snug whitespace-normal"
              variant={opened ? "default" : "outline"}
              disabled={!opened || loading}
              onClick={handleContinue}
            >
              <CheckCircle2 className="size-4 shrink-0" />
              {loading ? "Confirming…" : "I've joined — Continue"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
