// Deliberately simple, generic terms — unlike College Campus Partner's
// T&C (see college-campus-partner-terms-content.tsx), Promotional Partner
// carries no participant-target/benefit structure, just a referral code.
export function PromotionalPartnerTermsContent() {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">Terms &amp; Conditions</p>
      <div className="space-y-0.5 text-xs">
        <p>Organiser: YCC</p>
        <p>Programme: YCC Promotional Partner</p>
        <p>Campaign: YCC Kismat Ke Khiladi</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">1. What this is</h3>
        <p>
          A YCC Promotional Partner helps spread the word about YCC Kismat Ke
          Khiladi within their own network. In return, YCC issues the Partner
          a personal referral code, which they can share with people who
          register for the event.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">2. Nature of the role</h3>
        <p>
          This is a promotional, campaign-specific role. It does not
          constitute employment, agency, franchise, or any permanent
          partnership with YCC, and registering does not create any
          automatic entitlement to participate in future YCC programmes or
          campaigns.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">3. Conduct</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Share only genuine, accurate information about the campaign.</li>
          <li>Do not make unauthorised promises or guarantees about prizes, benefits, or outcomes on YCC&apos;s behalf.</li>
          <li>Do not create fake registrations or otherwise misuse your referral code.</li>
          <li>Do not misuse YCC&apos;s name, logo, or branding.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">4. Verification and disqualification</h3>
        <p>
          YCC may verify registrations made against a Partner&apos;s code.
          Fraudulent, duplicate, or otherwise invalid registrations will not
          be counted. YCC reserves the right to suspend or disqualify a
          Partner, and to withdraw their code, for any violation of these
          Terms, fraudulent activity, or misuse of YCC&apos;s branding.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">5. Changes</h3>
        <p>
          YCC may update these Terms or the Promotional Partner programme at
          any time; material changes will be communicated through YCC&apos;s
          official channels.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">6. Acceptance</h3>
        <p>
          By registering as a YCC Promotional Partner, you confirm that you
          have read, understood, and agreed to these Terms &amp; Conditions.
        </p>
      </div>
    </div>
  );
}
