// Official Terms & Conditions for YCC Kismat Ke Khiladi ft. Go, Goa, Gone,
// as provided by the organizer (September 2026), merged with the extra
// individual-player contest terms (final round, 12-season commitment, etc.).
// Section numbers are generated at render time so sections can be added or
// reordered freely. Rendering shape (title + p/ul blocks) matches
// partner-tournament-terms-content.tsx.

type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

interface TermsSection {
  title: string;
  /** Skips the auto-number (used for the closing notice). */
  unnumbered?: boolean;
  blocks: Block[];
}

const SECTIONS: TermsSection[] = [
  {
    title: "Event Structure",
    blocks: [
      {
        type: "p",
        text: "The Event consists of the following activities:",
      },
      {
        type: "ul",
        items: ["YCC Spin the Wheel", "YCC Cube Challenge", "YCC Box Cricket League"],
      },
      {
        type: "p",
        text: "The two challenges are intended to be completed by eligible participants along with participation in the YCC Box Cricket League, subject to the applicable eligibility requirements.",
      },
      {
        type: "p",
        text: "These Terms & Conditions apply specifically to the individual-player promotional contest, including its two challenges and the YCC Box Cricket League.",
      },
    ],
  },
  {
    title: "Individual Participation & Eligibility",
    blocks: [
      {
        type: "p",
        text: "The Event is open to individual players of any gender (male and female). Each Participant must personally take part in both the YCC Spin the Wheel and the YCC Cube Challenge, and may not participate through, or on behalf of, another person.",
      },
      {
        type: "p",
        text: "To become eligible for the applicable benefits, prizes, promotional rewards or other opportunities offered under YCC Kismat Ke Khiladi Ft. Go, Goa, Gone, a Participant must:",
      },
      {
        type: "ul",
        items: [
          "Actively participate in both YCC challenges;",
          "Participate in the YCC Box Cricket League — participation in the Box Cricket League is also required to receive the benefits;",
          "Follow all applicable rules and instructions issued by YCC;",
          "Complete the activities through the authorised YCC process;",
          "Provide accurate participant information wherever required; and",
          "Successfully pass YCC's verification process.",
        ],
      },
      {
        type: "p",
        text: "Participation in only one or two activities does not automatically establish eligibility for the benefits associated with completion of all three activities.",
      },
      {
        type: "p",
        text: "Participation in the Box Cricket League may require payment of the applicable tournament entry fee. The promotional challenges themselves may be offered free of participation charges unless otherwise communicated by YCC.",
      },
    ],
  },
  {
    title: "One-Attempt / One-Chance Policy",
    blocks: [
      {
        type: "p",
        text: "Each Participant is entitled to one official attempt only for each applicable challenge.",
      },
      {
        type: "p",
        text: "Once the Participant has completed an official attempt, the result recorded by YCC will be treated as the Participant's official result.",
      },
      {
        type: "p",
        text: "A Participant cannot:",
      },
      {
        type: "ul",
        items: [
          "Demand an additional attempt;",
          "Replay a challenge because they did not obtain the desired result;",
          "Request a result change after completion;",
          "Repeat a challenge through another person, device, account or method; or",
          "Claim that they should receive another opportunity because of an unfavourable result.",
        ],
      },
      {
        type: "p",
        text: "Any additional attempt may only be permitted by YCC in exceptional circumstances determined by the Organiser, including a verified technical or operational issue.",
      },
    ],
  },
  {
    title: "Role of YCC Campus Partners",
    blocks: [
      {
        type: "p",
        text: "YCC may conduct the challenges through its authorised YCC Campus Partners at participating colleges, campuses or classes.",
      },
      {
        type: "p",
        text: "The YCC Campus Partner is authorised to conduct the challenge according to the official instructions and process provided by YCC.",
      },
      {
        type: "p",
        text: "Participants must cooperate with the Campus Partner and must not:",
      },
      {
        type: "ul",
        items: [
          "Force or pressure a Campus Partner to provide another attempt;",
          "Demand repeated gameplay;",
          "Interfere with the official process;",
          "Attempt to manipulate the result; or",
          "Claim an unofficial attempt as an official attempt.",
        ],
      },
      {
        type: "p",
        text: "YCC reserves the right to review and verify the activities conducted by its Campus Partners.",
      },
    ],
  },
  {
    title: "Finality of the Official Game Result",
    blocks: [
      {
        type: "p",
        text: "The YCC Kismat Ke Khiladi challenge is intended to be a one-time participation opportunity for each eligible Participant.",
      },
      {
        type: "p",
        text: "Where the challenge is conducted by an authorised YCC Campus Partner in a Participant's class, campus or designated location, that officially recorded attempt will constitute the Participant's final official attempt for the Event.",
      },
      {
        type: "p",
        text: "If the Participant wins the challenge according to the applicable rules, the result will be recorded as a win. If the Participant does not win, the result will be recorded accordingly.",
      },
      {
        type: "p",
        text: "A Participant cannot demand a replay solely because they are dissatisfied with the outcome.",
      },
    ],
  },
  {
    title: "Game Rules",
    blocks: [
      { type: "p", text: "A. YCC Spin the Wheel" },
      {
        type: "ul",
        items: [
          "The Participant must select one number between 1 and 10.",
          "The Participant will receive one official opportunity to spin the wheel.",
          "The Participant wins the challenge only if the wheel lands on the number selected by the Participant, subject to verification by YCC.",
          "The official result recorded by YCC will be treated as the final result for that attempt.",
        ],
      },
      { type: "p", text: "B. YCC Cube Challenge" },
      {
        type: "ul",
        items: [
          "The Participant must select one number between 2 and 12.",
          "Two dice/cubes will be rolled as part of the challenge.",
          "The numbers appearing on both dice will be added together.",
          "The Participant wins the challenge only if the total of the two dice matches the number selected by the Participant.",
          "Only the officially recorded roll will be considered valid.",
          "The Participant will not be entitled to another attempt because the result was not in their favour.",
        ],
      },
    ],
  },
  {
    title: "YCC Box Cricket League",
    blocks: [
      {
        type: "p",
        text: "Participation in the YCC Box Cricket League is a separate sporting activity and is subject to its own tournament rules, registration requirements and applicable entry fees.",
      },
      {
        type: "p",
        text: "To qualify for benefits associated with YCC Kismat Ke Khiladi Ft. Go, Goa, Gone, the Participant must participate in the applicable YCC Box Cricket League.",
      },
      { type: "p", text: "Important:" },
      {
        type: "ul",
        items: [
          "YCC Box Cricket League participation is not necessarily free.",
          "The applicable tournament entry fee must be paid by the participating players in accordance with the tournament registration terms communicated by YCC.",
          "Payment of the Box Cricket entry fee does not by itself guarantee any prize, travel benefit, free trip, cash reward or other promotional benefit.",
        ],
      },
    ],
  },
  {
    title: "Promotional Benefits & Travel Coupons",
    blocks: [
      {
        type: "p",
        text: "Participants who successfully complete the required activities may become eligible for certain promotional benefits announced by YCC. Such benefits may include, subject to the specific promotion:",
      },
      {
        type: "ul",
        items: [
          "Special travel coupons;",
          "Promotional travel offers;",
          "Discounted trip opportunities;",
          "Event-related rewards;",
          "Special participant benefits; or",
          "Other benefits communicated by YCC.",
        ],
      },
      {
        type: "p",
        text: "Where a travel coupon or promotional travel offer is provided, the applicable terms, validity, availability, inclusions, exclusions, booking conditions and participant contribution will apply separately.",
      },
      {
        type: "p",
        text: "A promotional travel coupon should not be interpreted as an unconditional promise of a completely free trip unless YCC expressly states so in the applicable official promotion.",
      },
      {
        type: "p",
        text: "Any starting price communicated for the Goa Travel Coupon (e.g. ₹2,499/person) is based on train fares and other travel costs prevailing at the time of announcement. If train fares or other applicable travel costs increase due to circumstances beyond YCC's control, the participant contribution towards the coupon may increase correspondingly, and YCC will communicate the revised amount before it becomes payable.",
      },
    ],
  },
  {
    title: "Winner Selection & Final Round",
    blocks: [
      {
        type: "p",
        text: "Where the Event provides for a particular winner, only the Participant who satisfies all applicable eligibility requirements and official game conditions will qualify.",
      },
      {
        type: "p",
        text: "If multiple Participants qualify as winners, they will advance to a subsequent round. The subsequent round will repeat the official game and may also include two to three additional fun activities, as announced by YCC.",
      },
      {
        type: "p",
        text: "Only three (3) final winners will be selected. If a tie or identical result occurs, YCC may conduct a tie-break procedure — such as a repeat round, a random draw or another fair method announced at the time — among the verified eligible Participants, subject to applicable law and the specific promotion rules.",
      },
      {
        type: "p",
        text: "The Participants selected through this process will be treated as the winners for the applicable promotional benefit. YCC's records and verification process will be used to establish eligibility.",
      },
    ],
  },
  {
    title: "Future Tournament Participation Requirement",
    blocks: [
      {
        type: "p",
        text: "Each of the three (3) final winners is required to participate in twelve (12) seasons of the YCC Box Cricket Tournament within one (1) year, subject to the conditions below:",
      },
      {
        type: "ul",
        items: [
          "The requirement applies only where it is disclosed to the winner before participation;",
          "The schedule and applicable fees for each season will be communicated by YCC;",
          "Participation remains subject to the applicable tournament rules and entry fees; and",
          "Exceptions, such as postponements or cancellations of a season, will be communicated by YCC through its official channels.",
        ],
      },
    ],
  },
  {
    title: "Verification of Participation and Results",
    blocks: [
      {
        type: "p",
        text: "YCC may maintain records relating to participation in the Event, including, where applicable:",
      },
      {
        type: "ul",
        items: [
          "Participant details;",
          "Challenge participation;",
          "Number of attempts;",
          "Game results;",
          "Match participation;",
          "Official score or match records;",
          "Registration information;",
          "Digital records;",
          "Photographs/videos or other event records; and",
          "Other information reasonably required for verification.",
        ],
      },
      {
        type: "p",
        text: "Participants may be required to provide accurate details for verification.",
      },
      {
        type: "p",
        text: "These records may be used to verify whether a Participant genuinely participated and whether the Participant is eligible for a particular benefit or prize. Where appropriate, YCC may request additional information or documents for verification. Final results will be declared only after verification and communicated through YCC's official channels.",
      },
    ],
  },
  {
    title: "False Claims, Fake Screenshots & Fraudulent Representation",
    blocks: [
      {
        type: "p",
        text: "Participants must not submit or circulate false evidence of participation or winning. This includes, without limitation:",
      },
      {
        type: "ul",
        items: [
          "Fake screenshots;",
          "Edited screenshots;",
          "AI-generated images presented as genuine evidence;",
          "Manipulated videos;",
          "Fake certificates;",
          "False registration information;",
          "False match records;",
          "Impersonation of another Participant; or",
          "Any other misleading representation intended to obtain a prize, benefit or recognition.",
        ],
      },
      {
        type: "p",
        text: "YCC's official participation records and other available evidence may be used to verify such claims. If YCC determines that a claim is fraudulent, manipulated or materially misleading, YCC may:",
      },
      {
        type: "ul",
        items: [
          "Reject the claim;",
          "Disqualify the Participant;",
          "Cancel any benefit or prize associated with the fraudulent claim;",
          "Restrict the Participant from participating in future YCC activities; and/or",
          "Take appropriate legal or other action available under applicable law.",
        ],
      },
    ],
  },
  {
    title: "No Manipulation of the Game",
    blocks: [
      {
        type: "p",
        text: "Participants must not attempt to manipulate, interfere with or compromise the fairness of any challenge or tournament activity. Any attempt to:",
      },
      {
        type: "ul",
        items: [
          "Obtain additional attempts;",
          "Manipulate equipment;",
          "Interfere with dice, wheel or other game mechanisms;",
          "Tamper with digital records;",
          "Use another person's identity;",
          "Manipulate match participation records; or",
          "Otherwise obtain an unfair advantage",
        ],
      },
      {
        type: "p",
        text: "may result in immediate disqualification.",
      },
    ],
  },
  {
    title: "Player Verification",
    blocks: [
      {
        type: "p",
        text: "Each player must participate using their genuine identity and registered information. YCC may verify:",
      },
      {
        type: "ul",
        items: [
          "Player identity;",
          "Registration details;",
          "Match participation; and",
          "Other relevant records.",
        ],
      },
      {
        type: "p",
        text: "A player may not participate multiple times for the purpose of obtaining multiple promotional opportunities where the Event rules provide for one participation opportunity per player.",
      },
    ],
  },
  {
    title: "No Guarantee of Prize or Travel Benefit",
    blocks: [
      {
        type: "p",
        text: "Participation in the Event does not automatically guarantee a prize, free trip, cash reward, travel coupon or other benefit. Benefits are subject to:",
      },
      {
        type: "ul",
        items: [
          "Successful completion of the applicable activities;",
          "Eligibility;",
          "Verification;",
          "Availability;",
          "Applicable promotional conditions; and",
          "Compliance with these Terms & Conditions.",
        ],
      },
      {
        type: "p",
        text: "Where a benefit is subject to limited availability, YCC may specify the number of eligible winners or recipients in the applicable promotional announcement.",
      },
    ],
  },
  {
    title: "Changes, Suspension or Cancellation",
    blocks: [
      {
        type: "p",
        text: "YCC reserves the right, where reasonably necessary, to modify, suspend, postpone or cancel any part of the Event due to circumstances including:",
      },
      {
        type: "ul",
        items: [
          "Technical problems;",
          "Operational difficulties;",
          "Venue or scheduling issues;",
          "Force majeure events;",
          "Safety concerns;",
          "Fraud or attempted manipulation;",
          "Regulatory or legal requirements; or",
          "Other circumstances beyond the reasonable control of YCC.",
        ],
      },
      {
        type: "p",
        text: "Where material changes are made, YCC may communicate the applicable changes through its official communication channels.",
      },
    ],
  },
  {
    title: "Technical & Operational Issues",
    blocks: [
      {
        type: "p",
        text: "YCC will make reasonable efforts to conduct the challenges fairly and according to the announced rules.",
      },
      {
        type: "p",
        text: "However, YCC will not be responsible for failure or interruption caused by circumstances beyond its reasonable control, including internet connectivity, device malfunction, network problems, power failure, third-party technical services or other technical issues.",
      },
      {
        type: "p",
        text: "Where YCC determines that a genuine technical or operational error materially affected an official attempt, YCC may take appropriate corrective action, including permitting a fresh attempt where reasonably necessary.",
      },
      {
        type: "p",
        text: "If a verified malfunction or algorithmic error affects a challenge or its outcome, YCC may cancel the affected challenge and re-run it. YCC will notify Participants through its official channels, and the affected results will not be treated as final.",
      },
    ],
  },
  {
    title: "Participant Responsibility",
    blocks: [
      { type: "p", text: "Participants are responsible for:" },
      {
        type: "ul",
        items: [
          "Providing accurate information;",
          "Following the instructions of authorised YCC representatives;",
          "Maintaining their registration information;",
          "Participating personally;",
          "Following the applicable game and tournament rules; and",
          "Keeping any registration confirmation or other relevant information provided to them.",
        ],
      },
    ],
  },
  {
    title: "Acceptance of Terms",
    blocks: [
      {
        type: "p",
        text: "By participating in YCC Kismat Ke Khiladi Ft. Go, Goa, Gone, the Participant confirms that they have read and understood these Terms & Conditions and agree to comply with them.",
      },
      {
        type: "p",
        text: "Participation in the Event constitutes acceptance of these Terms & Conditions and the applicable rules communicated by YCC. YCC will communicate any material changes through its official channels.",
      },
    ],
  },
  {
    title: "Governing Law",
    blocks: [
      {
        type: "p",
        text: "These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of India.",
      },
      {
        type: "p",
        text: "Any dispute arising in connection with the Event shall be subject to the jurisdiction of the courts having appropriate jurisdiction over the Organiser's place of business, subject to applicable law.",
      },
    ],
  },
  {
    title: "Official Communication",
    blocks: [
      {
        type: "p",
        text: "Participants should rely only on information communicated through YCC's authorised and official communication channels.",
      },
      {
        type: "p",
        text: "YCC shall not be responsible for commitments, promises or representations made by unauthorised individuals.",
      },
      {
        type: "p",
        text: "For clarification regarding the Event, participants should contact YCC through its official communication channels.",
      },
    ],
  },
  {
    title: "Important Participant Notice",
    unnumbered: true,
    blocks: [
      {
        type: "ul",
        items: [
          "1 Player = 1 Official Attempt",
          "2 Challenges + YCC Box Cricket League = Eligibility for Applicable Event Benefits",
          "No Fake Screenshots • No Manipulation • No Extra Attempts",
          "Official YCC Records Will Be Used for Verification",
          "Box Cricket League Entry Fees Apply Separately",
          "3 Final Winners • 12 YCC Box Cricket Tournament Seasons Within 1 Year (As Disclosed)",
          "All Benefits Are Subject to Eligibility, Verification & Applicable Promotional Terms",
        ],
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

export function GoGoaGoneTermsContent() {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide uppercase text-foreground">
          YCC Kismat Ke Khiladi Ft. Go, Goa, Gone
        </p>
        <p className="font-medium text-foreground">Terms &amp; Conditions</p>
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern participation in YCC
          Kismat Ke Khiladi Ft. Go, Goa, Gone (&quot;Event&quot;),
          organised and managed by YCC (&quot;YCC&quot;, &quot;Organiser&quot;, &quot;we&quot;, &quot;us&quot; or
          &quot;our&quot;). By participating in any challenge or activity associated
          with this Event, the participant (&quot;Participant&quot;, &quot;you&quot; or &quot;your&quot;)
          acknowledges that they have read, understood and agreed to these
          Terms &amp; Conditions.
        </p>
      </div>

      {SECTIONS.map((section, index) => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {section.unnumbered
              ? section.title
              : `${SECTIONS.slice(0, index).filter((s) => !s.unnumbered).length + 1}. ${section.title}`}
          </h3>
          <div className="space-y-2">
            {section.blocks.map((block, i) => (
              <BlockContent key={i} block={block} />
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-0.5 border-t border-border pt-4 text-xs">
        <p>Organiser: YCC</p>
        <p>Event: YCC Kismat Ke Khiladi Ft. Go, Goa, Gone</p>
        <p>Nature of Activity: Sports Tournament, Games &amp; Promotional Contest</p>
        <p>Last Updated: September 2026</p>
      </div>
    </div>
  );
}
