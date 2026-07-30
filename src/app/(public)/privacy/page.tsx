import { BackButton } from "@/components/site/back-button";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton className="mb-4" />
      <h1 className="mb-1 text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="space-y-6 text-sm leading-relaxed sm:text-base">
        <Section title="1. What we collect">
          <p>
            When you register for a YCC event, we collect: your name, your
            college (selected from a fixed list), and your mobile number
            (for team events, this is collected for each player). We do not
            collect your email address or roll number.
          </p>
        </Section>

        <Section title="2. Payment information">
          <p>
            Payments are processed entirely by our payment partner,
            Razorpay. We never see or store your card, UPI, or bank
            details — we only receive confirmation that a payment succeeded
            or failed, along with a payment reference ID.
          </p>
        </Section>

        <Section title="3. How we use your information">
          <ul className="ml-4 list-disc space-y-1">
            <li>To create and confirm your registration</li>
            <li>To generate your unique participant ID and QR code</li>
            <li>
              To verify your identity and mark attendance at the venue
            </li>
            <li>
              To contact you about your registration if needed (via the
              mobile number provided)
            </li>
            <li>
              To generate aggregate reports (e.g. registrations per college)
              for event organizers
            </li>
          </ul>
        </Section>

        <Section title="4. Who can see your information">
          <p>
            Your registration details are visible to authorized YCC staff
            (for entry verification) and admins (for event reporting). We do
            not sell or share your personal information with third parties
            for marketing purposes.
          </p>
        </Section>

        <Section title="5. Receipt & re-download">
          <p>
            Your receipt (containing your name, college, unique ID, and QR
            code) can be re-downloaded at any time using your unique ID or
            the mobile number you registered with. This lookup is
            rate-limited to prevent misuse.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain registration and attendance data for as long as
            reasonably necessary for event operations, reporting, and
            record-keeping.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>
            You can request correction or deletion of your personal
            information by contacting us directly, subject to any
            legitimate need to retain records (e.g. for completed, paid
            registrations).
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            For privacy-related questions, reach us at{" "}
            <a href="tel:+918487832810" className="underline">
              +91 84878 32810
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold sm:text-lg">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}
