import { BackButton } from "@/components/site/back-button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton className="mb-4" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl text-blue-950">About YCC</h1>
      </div>

      <div className="text-muted-foreground space-y-4 text-sm leading-relaxed sm:text-base">
        <p>
          YCC — Yuva Champions Cricket — is a modern, youth-first cricket
          platform built by the youth, for the youth. We bring college
          students together through exciting cricket tournaments and quiz
          competitions, delivering unforgettable experiences, exclusive
          rewards, and opportunities to become tomorrow&apos;s champions.
        </p>
        <p>
          Our mission is simple: give college students a genuine platform to
          compete, showcase their talent, and build a name for themselves —
          on the field and off it. From tennis-ball and box cricket formats
          to general knowledge and sports quizzes, YCC events are designed to
          be accessible, competitive, and fun.
        </p>
        <p>
          Every team and participant that registers with YCC gets a smooth,
          mobile-first registration experience, instant digital receipts with
          a unique participant ID and QR code, and fair, transparent
          verification at the venue.
        </p>
        <p>
          We&apos;re just getting started — more tournaments, more colleges,
          and more formats are on the way. Follow our official channels for
          schedules, fixtures, and updates.
        </p>
      </div>

      <div className="mt-10 rounded-lg border p-4 text-sm">
        <p className="font-semibold">Get in touch</p>
        <p className="text-muted-foreground mt-1">
          Call or WhatsApp us at{" "}
          <a href="tel:+918487832810" className="underline">
            +91 84878 32810
          </a>
        </p>
      </div>
    </div>
  );
}
