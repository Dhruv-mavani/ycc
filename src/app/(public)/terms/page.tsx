import { BackButton } from "@/components/site/back-button";

const LAST_UPDATED = "August 15, 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BackButton className="mb-4" />
      <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
        YCC Partner Program
      </p>
      <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
        Terms & Conditions
      </h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="space-y-6 text-sm leading-relaxed sm:text-base">
        <p className="text-muted-foreground">
          These Terms & Conditions govern the participation, eligibility,
          benefits, responsibilities and opportunities associated with the
          YCC Partner Program. By joining the program, every Partner agrees
          to follow these terms and the decisions of the YCC Founding Team &
          Management.
        </p>

        <Section title="1. Partner Benefits Are Performance-Based">
          <p>
            YCC Partner benefits are not guaranteed or automatically
            available to every Partner.
          </p>
          <p>
            Benefits may be provided partially, selectively or periodically
            based on Partner performance, project participation,
            availability, contribution and overall YCC requirements.
          </p>
          <p>
            No Partner should assume that joining the program guarantees
            access to every listed benefit.
          </p>
        </Section>

        <Section title="2. Limited & Selective Benefits">
          <p>
            YCC may distribute benefits among selected Partners rather than
            providing every benefit to every Partner.
          </p>
          <p>
            For example, from a group of 100 Partners, approximately 20–25%
            may be selected for a particular benefit, depending on the
            nature and availability of that benefit.
          </p>
          <p>
            Different benefits may be assigned to different Partner groups
            based on performance, contribution, achievement and Management
            decisions.
          </p>
        </Section>

        <Section title="3. No Guaranteed Financial Benefit">
          <p>
            Participation in the YCC Partner Program does not automatically
            guarantee salary, commission, profit sharing, incentives or any
            fixed financial return.
          </p>
          <p>Any financial opportunity will depend on factors including:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Overall project revenue</li>
            <li>Actual profits</li>
            <li>Operating & project expenses</li>
            <li>Sponsorships and collections</li>
            <li>Business performance</li>
            <li>Partner contribution</li>
            <li>Project achievement</li>
            <li>Management decisions</li>
            <li>Other financial and operational factors</li>
          </ul>
        </Section>

        <Section title="4. Profit Sharing & Commission">
          <p>
            Profit sharing, commissions or other financial incentives,
            wherever applicable, will be offered only to eligible Partners
            and will be determined according to the applicable project or
            business structure.
          </p>
          <p>
            Any financial arrangement must be approved by the YCC Founding
            Team & Management before becoming effective.
          </p>
        </Section>

        <Section title="5. Management Authority">
          <p>
            The YCC Founding Team & Management shall have the authority to
            make final decisions regarding:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Partner eligibility</li>
            <li>Partner categories</li>
            <li>Targets</li>
            <li>Benefits</li>
            <li>Incentives</li>
            <li>Profit sharing</li>
            <li>Project assignments</li>
            <li>Business collaborations</li>
            <li>Promotions</li>
            <li>Partner recognition</li>
            <li>Suspension or termination</li>
          </ul>
          <p>
            Management decisions will be based on overall project
            requirements, Partner performance and the interests of YCC.
          </p>
        </Section>

        <Section title="6. Path to Official Senior Partner">
          <p>
            Joining YCC as a Partner does not automatically make an
            individual an Official Permanent Partner or Senior Management
            Member.
          </p>
          <p>
            To be considered for YCC Official Senior Management, a Partner
            should generally:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Complete 3+ years of active association with YCC.</li>
            <li>Successfully participate in 25+ YCC Projects.</li>
            <li>Demonstrate consistent performance and responsibility.</li>
            <li>Maintain professional conduct and commitment.</li>
            <li>Contribute meaningfully to YCC&apos;s growth.</li>
            <li>
              Successfully complete projects across different YCC
              activities, including Box Cricket, Quiz & Challenges, Tennis
              Ball Tournaments, Marketing Campaigns and other YCC projects.
            </li>
          </ul>
          <p>
            Final recognition will remain subject to approval by the YCC
            Founding Team & Management.
          </p>
        </Section>

        <Section title="7. YCC Business Program">
          <p>
            Only selected YCC Partners and Co-Partners may be invited to
            participate in the YCC Business Program.
          </p>
          <p>
            The program may involve business, management, marketing or
            commercial collaborations designed to create mutual financial
            growth and independence.
          </p>
          <p>Selection will depend on factors such as:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Performance</li>
            <li>Reliability</li>
            <li>Leadership</li>
            <li>Project contribution</li>
            <li>Business understanding</li>
            <li>Long-term commitment</li>
            <li>Professional conduct</li>
            <li>Trust and responsibility</li>
          </ul>
          <p>
            Participation in the Business Program is by invitation/approval
            only and is not an automatic Partner benefit.
          </p>
        </Section>

        <Section title="8. Partner Targets & Performance">
          <p>
            Partners may receive specific targets for individual campaigns
            or projects.
          </p>
          <p>
            Failure to achieve a target does not necessarily result in
            immediate termination; however, repeated non-performance may
            affect:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Eligibility for benefits</li>
            <li>Future project assignments</li>
            <li>Financial opportunities</li>
            <li>Partner status</li>
            <li>Selection for special programs</li>
          </ul>
        </Section>

        <Section title="9. No Guarantee of Project Allocation">
          <p>
            YCC does not guarantee that every Partner will receive the same
            number of projects, responsibilities, opportunities or
            assignments.
          </p>
          <p>
            Project allocation may depend on operational requirements,
            location, availability, performance and Management decisions.
          </p>
        </Section>

        <Section title="10. Professional Conduct">
          <p>Every Partner is expected to represent YCC professionally.</p>
          <p>Partners must not:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Misrepresent YCC or its activities.</li>
            <li>Make unauthorized financial promises.</li>
            <li>Collect money on behalf of YCC without authorization.</li>
            <li>Make commitments in YCC&apos;s name without approval.</li>
            <li>Engage in fraudulent or misleading activities.</li>
            <li>Damage YCC&apos;s reputation or relationships.</li>
            <li>Misuse YCC&apos;s name, logo, identity or materials.</li>
          </ul>
        </Section>

        <Section title="11. Brand & Intellectual Property">
          <p>
            The YCC name, logo, designs, promotional materials, campaigns,
            concepts, documents and other intellectual property remain the
            property of YCC or their respective owners.
          </p>
          <p>
            Partners may use YCC branding only for authorized YCC activities
            and may not independently represent themselves as owners,
            founders, directors or authorized representatives of YCC
            without written approval.
          </p>
        </Section>

        <Section title="12. Confidentiality">
          <p>
            Partners may receive access to confidential information relating
            to YCC projects, campaigns, business plans, financial
            information, partner networks, sponsors, strategies or internal
            operations.
          </p>
          <p>
            Such information must not be disclosed, shared, copied or
            commercially used without authorization.
          </p>
        </Section>

        <Section title="13. Expenses & Reimbursements">
          <p>
            Any travel, accommodation, food, promotional, transportation or
            other expenses incurred by a Partner will be the Partner&apos;s
            responsibility unless YCC has specifically approved
            reimbursement or sponsorship in advance.
          </p>
          <p>
            Verbal assumptions regarding reimbursement will not create an
            obligation for YCC.
          </p>
        </Section>

        <Section title="14. Partner Status Is Non-Transferable">
          <p>
            A YCC Partner position is personal and cannot be sold,
            transferred, assigned or given to another individual without
            approval from YCC Management.
          </p>
        </Section>

        <Section title="15. Suspension & Termination">
          <p>
            YCC reserves the right to suspend, review or terminate a
            Partner&apos;s association if the Partner:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Violates YCC policies or these Terms & Conditions.</li>
            <li>Engages in misconduct or fraud.</li>
            <li>Misuses YCC branding or resources.</li>
            <li>Provides false information.</li>
            <li>Repeatedly fails to perform assigned responsibilities.</li>
            <li>Damages YCC&apos;s reputation or business interests.</li>
            <li>Violates confidentiality.</li>
            <li>Acts against the legitimate interests of YCC.</li>
          </ul>
        </Section>

        <Section title="16. Changes to the Partner Program">
          <p>
            YCC reserves the right to modify, restructure, add, remove or
            replace Partner benefits, targets, categories, projects and
            policies based on business requirements.
          </p>
          <p>Any future changes may apply to existing as well as new Partners.</p>
        </Section>

        <Section title="17. No Employment Relationship">
          <p>
            Unless separately agreed in writing, participation as a YCC
            Partner does not automatically create an employer-employee
            relationship, salary-based employment, agency, franchise,
            partnership or ownership interest in YCC.
          </p>
          <p>A Partner is an independent participant in the YCC Partner Program.</p>
        </Section>

        <Section title="18. No Ownership Rights">
          <p>
            Being a YCC Partner does not automatically provide any
            ownership, equity, shares, voting rights, intellectual-property
            rights or management authority in YCC.
          </p>
          <p>
            Such rights, if ever offered, must be established through a
            separate written agreement.
          </p>
        </Section>

        <Section title="19. Final Authority">
          <p>
            All matters relating to Partner selection, benefits, financial
            opportunities, project allocation, recognition, business
            collaboration and Partner status shall remain subject to the
            final decision of the YCC Founding Team & Management.
          </p>
        </Section>

        <Section title="20. Acceptance">
          <p>
            By joining or continuing participation in the YCC Partner
            Program, the Partner confirms that they have read, understood
            and accepted these Terms & Conditions.
          </p>
          <p>
            YCC reserves the right to interpret and administer these Terms &
            Conditions in accordance with the overall objectives,
            operational requirements and long-term interests of YCC.
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
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  );
}
