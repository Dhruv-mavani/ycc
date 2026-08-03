import { BackButton } from "@/components/site/back-button";

const LAST_UPDATED = "August 3, 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton className="mb-4" />
      <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
        Terms & Conditions
      </h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="space-y-6 text-sm leading-relaxed sm:text-base">
        <Section title="1. Eligibility">
          <p>
            YCC (Yuva Champions Cricket) events are open to college students.
            By registering, you confirm that the details you provide (name,
            college, and mobile number) are accurate and belong to you or,
            in the case of a team registration, to the players you are
            registering on behalf of.
          </p>
        </Section>

        <Section title="2. Registration & Payment">
          <p>
            Registration is only confirmed once payment is successfully
            completed through our payment partner, Razorpay. Entry fees
            shown on the site are inclusive of all applicable taxes. We do
            not store your card, UPI, or bank details — payments are
            processed directly and securely by Razorpay.
          </p>
        </Section>

        <Section title="3. Refunds & Cancellations">
          <p>
            Registration fees are generally non-refundable once payment is
            confirmed, including in cases of no-shows or self-withdrawal.
            If an event is cancelled or rescheduled by YCC, we will
            communicate the applicable refund or rescheduling policy for
            that specific event separately.
          </p>
        </Section>

        <Section title="4. Entry Verification">
          <p>
            Each confirmed registration receives a unique participant ID and
            QR code. You are responsible for keeping this ID/QR code safe
            and presenting it (digitally or printed) at the venue for entry
            verification. Entry may be refused without a valid, matching ID.
          </p>
        </Section>

        <Section title="5. Team Registrations">
          <p>
            For team events, the person completing registration is
            responsible for the accuracy of all listed team members&apos;
            details and for communicating event information to their team.
          </p>
        </Section>

        <Section title="6. Conduct">
          <p>
            Participants are expected to conduct themselves respectfully
            toward organizers, staff, volunteers, and fellow participants.
            YCC reserves the right to disqualify or remove any participant
            or team for unsportsmanlike conduct, misconduct, or violation of
            venue rules, without a refund.
          </p>
        </Section>

        <Section title="7. Liability">
          <p>
            Participation in cricket matches and other physical/competitive
            activities carries an inherent risk of injury. Participants take
            part at their own risk. YCC and its organizers are not liable
            for personal injury, loss, or damage to property arising from
            participation, except where caused by our proven negligence.
          </p>
        </Section>

        <Section title="8. Changes to Events">
          <p>
            YCC reserves the right to modify event formats, schedules,
            venues, or rules where necessary, and will make reasonable
            efforts to communicate significant changes in advance.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For questions about these terms, reach us at{" "}
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
