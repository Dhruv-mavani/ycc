type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

interface TermsSection {
  title: string;
  blocks: Block[];
}

const SECTIONS: TermsSection[] = [
  {
    title: "1. Nature and Scope of Partnership",
    blocks: [
      {
        type: "p",
        text: '1.1 By registering as a YCC College Campus Partner, the individual ("Partner") agrees to participate as a promotional partner of YCC for the designated campaign and the specific upcoming events communicated by YCC.',
      },
      {
        type: "p",
        text: '1.2 The current Partner association covers "YCC Kismat Ke Khiladi Ft. Go, Goa, Gone" and two other upcoming YCC events specifically designated by YCC.',
      },
      {
        type: "p",
        text: "1.3 The Partner relationship is campaign-specific and promotional in nature. It does not constitute employment, permanent membership, agency, franchise, distributorship, or a permanent partnership with YCC.",
      },
      {
        type: "p",
        text: "1.4 Registration as a YCC College Campus Partner does not create any automatic entitlement to participate in future YCC programmes or campaigns.",
      },
    ],
  },
  {
    title: "2. Role of a Promotional Partner",
    blocks: [
      {
        type: "p",
        text: "2.1 A Promotional Partner is responsible for actively promoting the designated YCC campaign within their college, class, student network, and permitted personal or professional network.",
      },
      {
        type: "p",
        text: "2.2 The Partner shall undertake reasonable promotional activities communicated by YCC, including promoting the campaign, encouraging eligible participants to register, communicating official campaign information, and completing the assigned participation targets.",
      },
      {
        type: "p",
        text: "2.3 Partners shall use only official information, promotional materials, registration links, codes, and instructions provided or authorised by YCC.",
      },
      {
        type: "p",
        text: "2.4 The Partner shall not make unauthorised promises, representations, guarantees, or commitments regarding YCC prizes, benefits, travel, tickets, gifts, cash rewards, or other incentives.",
      },
    ],
  },
  {
    title: "3. Campaign Activities",
    blocks: [
      {
        type: "p",
        text: "3.1 The YCC Kismat Ke Khiladi Ft. Go, Goa, Gone campaign consists of three designated activities:",
      },
      { type: "p", text: "Challenge Games" },
      {
        type: "ul",
        items: ["YCC Spin the Wheel", "YCC Dice Challenge"],
      },
      { type: "p", text: "Tournament" },
      { type: "ul", items: ["YCC Box Cricket Tournament"] },
      {
        type: "p",
        text: "3.2 YCC College Campus Partners are required to actively promote all three activities within their designated college/class.",
      },
    ],
  },
  {
    title: "4. Mandatory Partner Target",
    blocks: [
      {
        type: "p",
        text: "4.1 Each YCC College Campus Partner shall be required to successfully bring 30 individual eligible male participants from their designated class, subject to the campaign's eligibility requirements.",
      },
      {
        type: "p",
        text: "4.2 Each of the 30 participants must actively participate in all three campaign activities:",
      },
      {
        type: "ul",
        items: ["YCC Spin the Wheel;", "YCC Dice Challenge; and", "YCC Box Cricket Tournament."],
      },
      {
        type: "p",
        text: "4.3 The Partner's target shall therefore be calculated as:",
      },
      {
        type: "p",
        text: "1 College Campus Partner → 30 Individual Participants → 3 Required Activities per Participant.",
      },
      {
        type: "p",
        text: "4.4 A participant shall be counted as a fully qualifying participant only after participation in all three required activities has been completed and verified by YCC.",
      },
    ],
  },
  {
    title: "5. Partial Participation",
    blocks: [
      {
        type: "p",
        text: "5.1 Participation in only one or two campaign activities shall not constitute complete participation for the purpose of satisfying the Partner's target.",
      },
      { type: "p", text: "5.2 For example, if a participant:" },
      {
        type: "ul",
        items: [
          "participates in YCC Spin the Wheel;",
          "participates in YCC Dice Challenge; but",
          "does not participate in YCC Box Cricket Tournament,",
        ],
      },
      {
        type: "p",
        text: "that participant shall not be treated as a fully qualifying participant for the Partner's 30-participant target.",
      },
      {
        type: "p",
        text: "5.3 If any of the required 30 participants fails to complete all three activities within the applicable campaign period, the Partner's target shall remain incomplete unless the participation requirement is subsequently fulfilled within the permitted period.",
      },
    ],
  },
  {
    title: "6. Partner Benefits and Eligibility",
    blocks: [
      {
        type: "p",
        text: "6.1 Partner benefits, rewards, perks, passes, tickets, gifts, travel benefits, or other incentives offered by YCC are limited, conditional, and subject to the applicable campaign terms.",
      },
      {
        type: "p",
        text: "6.2 Partner benefits are not guaranteed solely because an individual has registered as a YCC College Campus Partner.",
      },
      { type: "p", text: "6.3 Eligibility for a benefit may depend upon:" },
      {
        type: "ul",
        items: [
          "completion of the assigned Partner target;",
          "successful participation and verification;",
          "timing of completion;",
          "availability of the relevant benefit;",
          "limited quota or number of available benefits;",
          "overall campaign performance; and",
          "any additional conditions communicated by YCC.",
        ],
      },
      {
        type: "p",
        text: "6.4 Where a benefit is expressly designated as a limited, early, first-qualified, or performance-based benefit, it shall be available only to Partners who satisfy the relevant criteria within the applicable quota and period.",
      },
      {
        type: "p",
        text: "6.5 Accordingly, completion of the general Partner target does not automatically guarantee every advertised benefit where that benefit is expressly subject to limited availability, campaign performance, or other stated conditions.",
      },
    ],
  },
  {
    title: "7. Campaign Performance and Overall Target",
    blocks: [
      {
        type: "p",
        text: "7.1 The Partner benefits under this programme are also subject to the overall performance and commercial outcome of the campaign, as determined by YCC.",
      },
      {
        type: "p",
        text: "7.2 For the current campaign, YCC has established an internal overall campaign target of 9,000+ team registrations across the designated college campaign for:",
      },
      {
        type: "p",
        text: "YCC Kismat Ke Khiladi Ft. Go, Goa, Gone + YCC Box Cricket Tournament.",
      },
      {
        type: "p",
        text: "7.3 The Partner acknowledges that this overall campaign target is a campaign-level performance condition and is separate from the individual Partner's 30-participant target.",
      },
      {
        type: "p",
        text: "7.4 If the campaign does not achieve the applicable overall target or does not generate the expected campaign performance/return, YCC may reduce, withdraw, cancel, modify, or withhold performance-dependent Partner benefits, subject to the specific benefit terms communicated by YCC.",
      },
      {
        type: "p",
        text: "7.5 Accordingly, completion of an individual Partner's promotional target shall not, by itself, create an unconditional entitlement to benefits that are expressly dependent upon overall campaign performance or ROI.",
      },
    ],
  },
  {
    title: "8. No Right to Demand or Compel Benefits",
    blocks: [
      {
        type: "p",
        text: "8.1 A Partner shall not have the right to demand, compel, force, or otherwise require YCC to provide any benefit where the applicable eligibility conditions have not been satisfied.",
      },
      {
        type: "p",
        text: "8.2 Failure to complete the required task, target, participation requirement, deadline, verification process, or campaign-level condition may result in the corresponding benefit becoming unavailable.",
      },
      {
        type: "p",
        text: "8.3 No benefit shall be payable merely on the basis of partial performance.",
      },
      {
        type: "p",
        text: "8.4 Unless expressly confirmed by YCC in writing, Partner benefits shall not be treated as guaranteed monetary compensation, salary, commission, or contractual remuneration.",
      },
    ],
  },
  {
    title: "9. Limited and Event-Specific Benefits",
    blocks: [
      {
        type: "p",
        text: "9.1 All benefits and perks provided to YCC College Campus Partners and their supporting team members are limited to the applicable campaign/event for which they are announced.",
      },
      {
        type: "p",
        text: "9.2 Event-specific benefits shall not automatically carry forward to future YCC events.",
      },
      {
        type: "p",
        text: "9.3 Upon completion or closure of the applicable campaign, any eligibility period or benefit criteria associated exclusively with that campaign shall expire unless YCC expressly extends them.",
      },
      {
        type: "p",
        text: "9.4 Unclaimed, unused, or unfulfilled benefits may expire after the applicable deadline communicated by YCC.",
      },
    ],
  },
  {
    title: "10. Order of Qualification for Limited Benefits",
    blocks: [
      {
        type: "p",
        text: "10.1 Where a benefit is available only to a limited number of qualifying Partners, eligibility may be determined based on the date and time of successful completion and verification of the applicable requirements.",
      },
      {
        type: "p",
        text: "10.2 The Partner understands that completing the requirements earlier may provide eligibility for an available limited benefit, subject to verification and the remaining quota.",
      },
      {
        type: "p",
        text: "10.3 Once the applicable quota has been exhausted, subsequent Partners may not qualify for that particular limited benefit even if they subsequently complete the general requirements.",
      },
    ],
  },
  {
    title: "11. Verification and Records",
    blocks: [
      {
        type: "p",
        text: "11.1 YCC may verify participant registrations, activity participation, tournament participation, partner codes, registration records, attendance, and other relevant campaign information.",
      },
      {
        type: "p",
        text: "11.2 Only genuine, eligible, and verifiable participants shall be counted towards the Partner's target.",
      },
      {
        type: "p",
        text: "11.3 Duplicate, false, fabricated, manipulated, misleading, or otherwise invalid registrations or participation records shall not be counted.",
      },
      {
        type: "p",
        text: "11.4 YCC may require reasonable supporting information or evidence to verify completion of the Partner's assigned requirements.",
      },
    ],
  },
  {
    title: "12. Partner Conduct and Compliance",
    blocks: [
      {
        type: "p",
        text: "12.1 Partners shall conduct promotional activities in a professional, respectful, and lawful manner.",
      },
      { type: "p", text: "12.2 Partners shall not:" },
      {
        type: "ul",
        items: [
          "provide false or misleading information;",
          "create or submit fake registrations;",
          "manipulate participant records;",
          "misuse YCC's name, logo, brand, or promotional material;",
          "make unauthorised guarantees regarding benefits or prizes; or",
          "engage in conduct that may materially harm YCC, its participants, or the campaign.",
        ],
      },
      {
        type: "p",
        text: "12.3 Any material violation may result in suspension or disqualification from the Partner programme.",
      },
    ],
  },
  {
    title: "13. Disqualification and Termination",
    blocks: [
      {
        type: "p",
        text: "13.1 YCC Management reserves the right to suspend, remove, or disqualify a Partner from the YCC College Campus Partner Programme and/or the applicable campaign in the event of:",
      },
      {
        type: "ul",
        items: [
          "violation of these Terms & Conditions;",
          "fraudulent or deceptive activity;",
          "submission of false information;",
          "manipulation of campaign results or registrations;",
          "misuse of YCC branding or promotional material;",
          "unauthorised representation of YCC; or",
          "conduct contrary to the campaign rules or applicable law.",
        ],
      },
      {
        type: "p",
        text: "13.2 Upon disqualification, any pending or unissued campaign benefit associated with the Partner may be cancelled.",
      },
      {
        type: "p",
        text: "13.3 Disqualification from one campaign does not necessarily determine eligibility for future YCC programmes, which may be subject to separate terms and approval.",
      },
    ],
  },
  {
    title: "14. Changes to Campaign Terms",
    blocks: [
      {
        type: "p",
        text: "14.1 YCC reserves the right, where reasonably necessary, to modify campaign schedules, procedures, targets, deadlines, participation requirements, benefit availability, or other operational conditions.",
      },
      {
        type: "p",
        text: "14.2 Any material changes applicable to Partners shall be communicated through YCC's official communication channels.",
      },
      {
        type: "p",
        text: "14.3 Where a benefit is subject to a fixed quota, YCC may close eligibility for that benefit once the announced quota has been reached.",
      },
    ],
  },
  {
    title: "15. Acceptance of Terms",
    blocks: [
      {
        type: "p",
        text: "15.1 By registering as or participating as a YCC College Campus Partner, the Partner confirms that they have read, understood, and agreed to these Terms & Conditions and any campaign-specific instructions issued by YCC.",
      },
      { type: "p", text: "15.2 The Partner acknowledges that:" },
      {
        type: "p",
        text: "30 Participants + Complete Participation in All 3 Activities + Verification = Completion of the Individual Partner Target.",
      },
      {
        type: "p",
        text: "15.3 The Partner further acknowledges that completion of the individual target does not automatically guarantee a limited or performance-dependent benefit where such benefit is subject to availability, early qualification, campaign performance, ROI, verification, or any other expressly stated condition.",
      },
      {
        type: "p",
        text: "15.4 The Partner agrees that YCC's campaign rules, verification requirements, and applicable benefit conditions shall govern eligibility for Partner benefits.",
      },
    ],
  },
];

function BlockContent({ block }: { block: Block }) {
  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p>{block.text}</p>;
}

export function CollegeCampusPartnerTermsContent() {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">Terms &amp; Conditions</p>
      <div className="space-y-0.5 text-xs">
        <p>Organiser: YCC</p>
        <p>Programme: YCC College Campus Partner</p>
        <p>Campaign: YCC Kismat Ke Khiladi Ft. Go, Goa, Gone</p>
        <p>Partner Type: Promotional Partner</p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {section.title}
          </h3>
          <div className="space-y-2">
            {section.blocks.map((block, i) => (
              <BlockContent key={i} block={block} />
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="text-xs font-semibold tracking-wide uppercase text-foreground">
          Partner Eligibility — Quick Reference
        </p>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Individual Partner Target</p>
          <p>30 Individual Participants from Your Designated Class</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Each participant must complete:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>① YCC Spin the Wheel</li>
            <li>② YCC Dice Challenge</li>
            <li>③ YCC Box Cricket Tournament</li>
          </ul>
          <p>All 3 activities are mandatory for each qualifying participant.</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Example</p>
          <p>
            Participant A: Spin the Wheel ✓ + Dice Challenge ✓ + Box Cricket ✓
            → Counts as 1 qualifying participant
          </p>
          <p>
            Participant B: Spin the Wheel ✓ + Dice Challenge ✓ + Box Cricket ✗
            → Does not count as a fully qualifying participant
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Benefit Eligibility</p>
          <p>
            Complete Target → Verification → Check Limited/Performance
            Conditions → Benefit Eligibility
          </p>
          <p>
            Partner benefits may additionally depend upon limited
            availability, early qualification, overall campaign performance,
            and achievement of the applicable campaign-level target.
          </p>
        </div>
      </div>
    </div>
  );
}
