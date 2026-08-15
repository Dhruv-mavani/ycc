type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

interface TermsSection {
  title: string;
  blocks: Block[];
}

const SECTIONS: TermsSection[] = [
  {
    title: "1. Mandatory Partner Participation",
    blocks: [
      {
        type: "p",
        text: "Every YCC Partner and Co-Partner is expected to actively participate in designated YCC Partner Special Events, Partner Activities and Partner Cricket Tournaments as part of the Partner Program.",
      },
      {
        type: "p",
        text: "Participation may be considered when evaluating future Partner opportunities, benefits and recognition.",
      },
    ],
  },
  {
    title: "2. Partner as Team Captain",
    blocks: [
      {
        type: "p",
        text: "For the Partner Special Cricket Tournament, each participating Partner/Co-Partner will generally participate as the Captain of their respective team.",
      },
      { type: "p", text: "The Captain is responsible for:" },
      {
        type: "ul",
        items: [
          "Forming their team.",
          "Bringing the required players.",
          "Coordinating with all team members.",
          "Completing the team registration.",
          "Ensuring the team follows tournament rules.",
          "Managing communication between the team and YCC Management.",
        ],
      },
    ],
  },
  {
    title: "3. Team Entry Fee",
    blocks: [
      {
        type: "p",
        text: "The Team Captain is responsible for completing the required Team Registration and Team Entry Fee payment within the deadline communicated by YCC.",
      },
      {
        type: "p",
        text: "The Captain may collect the team contribution from players in any mutually agreed manner.",
      },
      { type: "p", text: "For example, the Captain may:" },
      {
        type: "ul",
        items: [
          "Divide the total fee equally among players.",
          "Collect different amounts from different players.",
          "Personally contribute part of the fee.",
          "Arrange the contribution through another mutually agreed method.",
        ],
      },
      {
        type: "p",
        text: "The internal collection method between the Captain and players is the Captain's responsibility.",
      },
    ],
  },
  {
    title: "4. Partner Benefits Apply to the Partner Only",
    blocks: [
      {
        type: "p",
        text: "Participation in the YCC Partners Special Tournament does not automatically make the entire team eligible for YCC Partner benefits.",
      },
      {
        type: "p",
        text: "Benefits and perks offered under the YCC Partner Program are applicable to the registered YCC Partner/Co-Partner only, unless YCC specifically announces otherwise.",
      },
      {
        type: "p",
        text: "Team members, friends or players participating under the Partner's team will not automatically receive Partner benefits.",
      },
    ],
  },
  {
    title: "5. Limited & Selective Benefits",
    blocks: [
      {
        type: "p",
        text: "YCC Partner benefits are limited and selective and are not guaranteed for every Partner.",
      },
      {
        type: "p",
        text: "For example, if there are 100 participating Partner Captains:",
      },
      {
        type: "ul",
        items: [
          "Approximately 8% to 12% may receive a fully sponsored/free trip.",
          "Another 8% to 12% may receive a partially sponsored trip.",
          "Actual number of percentage may varies depending on certain conditions.",
          "Other Partners may receive different benefits, opportunities or gifts.",
        ],
      },
      {
        type: "p",
        text: "These percentages are illustrative and may change depending on the particular project, available budget, revenue, profitability and Management decisions.",
      },
    ],
  },
  {
    title: "6. Benefits Are Not Guaranteed",
    blocks: [
      { type: "p", text: "All Partner benefits are subject to:" },
      {
        type: "ul",
        items: [
          "Overall YCC revenue.",
          "Actual project profitability.",
          "Operational expenses.",
          "Sponsorship revenue.",
          "Event costs.",
          "Travel and accommodation costs.",
          "Business conditions.",
          "Management requirements.",
          "Partner performance.",
          "Overall project achievement.",
        ],
      },
      {
        type: "p",
        text: "Therefore, YCC reserves the right to modify, reduce, postpone or cancel any proposed benefit if financial, operational or management conditions do not support it.",
      },
    ],
  },
  {
    title: "7. Performance-Based Opportunities",
    blocks: [
      {
        type: "p",
        text: "Certain Partner benefits and opportunities may be awarded based on individual performance and contribution.",
      },
      { type: "p", text: "Factors may include:" },
      {
        type: "ul",
        items: [
          "Registration performance.",
          "Campaign promotion.",
          "Project participation.",
          "Team coordination.",
          "Leadership.",
          "Reliability.",
          "Attendance.",
          "Contribution to YCC growth.",
          "Professional conduct.",
        ],
      },
      {
        type: "p",
        text: "Higher performance may result in greater consideration for selected opportunities.",
      },
    ],
  },
  {
    title: "8. Financial & Operational Conditions",
    blocks: [
      { type: "p", text: "Not every benefit will be performance-based." },
      {
        type: "p",
        text: "Some benefits may depend primarily on the overall financial and operational condition of YCC.",
      },
      {
        type: "p",
        text: "Therefore, even a high-performing Partner may not receive a particular benefit if the relevant project does not generate sufficient revenue or profit.",
      },
    ],
  },
  {
    title: "9. No Automatic Right to Benefits",
    blocks: [
      {
        type: "p",
        text: "Joining YCC as a Partner or Co-Partner does not create an automatic contractual right to receive:",
      },
      {
        type: "ul",
        items: [
          "Free trips.",
          "Sponsored trips.",
          "Cash rewards.",
          "Profit sharing.",
          "Gifts.",
          "Event passes.",
          "International travel.",
          "Business opportunities.",
        ],
      },
      {
        type: "p",
        text: "Such benefits are opportunities offered by YCC, subject to the applicable conditions and Management approval.",
      },
    ],
  },
  {
    title: "10. Partner vs. Team Member",
    blocks: [
      {
        type: "p",
        text: "The Partner is the individual registered with YCC under the Partner Program.",
      },
      {
        type: "p",
        text: "Team members participating in the Partner's cricket team are tournament participants only unless they separately become approved YCC Partners or Co-Partners.",
      },
    ],
  },
  {
    title: "11. Captain's Responsibility",
    blocks: [
      {
        type: "p",
        text: "The Captain is responsible for ensuring that all players:",
      },
      {
        type: "ul",
        items: [
          "Provide accurate registration information.",
          "Follow tournament rules.",
          "Attend the tournament as required.",
          "Maintain appropriate conduct.",
          "Follow instructions from YCC officials.",
        ],
      },
      {
        type: "p",
        text: "The Captain should also communicate important YCC instructions to their team.",
      },
    ],
  },
  {
    title: "12. Player Replacement",
    blocks: [
      {
        type: "p",
        text: "Any player replacement, addition or withdrawal must follow the tournament rules and registration deadline established by YCC.",
      },
      {
        type: "p",
        text: "YCC Management reserves the right to approve or reject player changes.",
      },
    ],
  },
  {
    title: "13. Tournament Rules",
    blocks: [
      {
        type: "p",
        text: "All Partners, Captains and Players must follow the official rules, schedules, venue policies and instructions issued by YCC.",
      },
      {
        type: "p",
        text: "The decision of the authorized YCC Tournament Management/Officials regarding match operations and tournament administration shall be final, subject to any published appeal or review process.",
      },
    ],
  },
  {
    title: "14. No Transfer of Partner Benefits",
    blocks: [
      {
        type: "p",
        text: "Partner benefits are generally personal to the registered Partner and cannot be transferred, sold or exchanged with another person without prior approval from YCC.",
      },
    ],
  },
  {
    title: "15. Attendance & Commitment",
    blocks: [
      {
        type: "p",
        text: "Partners are expected to maintain reasonable attendance and commitment toward Partner events and assigned YCC activities.",
      },
      {
        type: "p",
        text: "Repeated absence, non-participation or failure to fulfill responsibilities may affect eligibility for future opportunities.",
      },
    ],
  },
  {
    title: "16. Cancellation Due to Business Conditions",
    blocks: [
      {
        type: "p",
        text: "YCC may cancel, postpone, restructure or replace a Partner benefit, event or opportunity because of:",
      },
      {
        type: "ul",
        items: [
          "Financial constraints.",
          "Insufficient revenue.",
          "Low profitability.",
          "Sponsorship changes.",
          "Venue or travel issues.",
          "Operational difficulties.",
          "Force majeure.",
          "Safety concerns.",
          "Changes in project strategy.",
        ],
      },
      {
        type: "p",
        text: "In such circumstances, YCC will determine the appropriate alternative, if any.",
      },
    ],
  },
  {
    title: "17. No Guaranteed Monetary Value",
    blocks: [
      {
        type: "p",
        text: "Unless a benefit is specifically confirmed by YCC in writing, Partners should not assume any particular monetary value for a benefit.",
      },
      {
        type: "p",
        text: 'For example, a reference to a "sponsored trip" does not automatically mean that all travel, accommodation, food, transportation or personal expenses will be fully covered.',
      },
      { type: "p", text: "The exact inclusions will be communicated separately." },
    ],
  },
  {
    title: "18. No Unauthorized Commitments",
    blocks: [
      {
        type: "p",
        text: "Partners and Captains must not make financial promises, sponsorship commitments, prize guarantees or other commitments on behalf of YCC without prior authorization.",
      },
    ],
  },
  {
    title: "19. Professional Conduct",
    blocks: [
      {
        type: "p",
        text: "Partners are expected to represent YCC responsibly and professionally.",
      },
      {
        type: "p",
        text: "Any fraud, manipulation, harassment, financial misconduct, deliberate misrepresentation, misuse of YCC's name or serious misconduct may result in suspension or termination from the Partner Program.",
      },
    ],
  },
  {
    title: "20. Final Decision",
    blocks: [
      {
        type: "p",
        text: "The YCC Founding Team & Management shall have the final authority regarding:",
      },
      {
        type: "ul",
        items: [
          "Partner selection.",
          "Tournament participation.",
          "Benefits and perks.",
          "Benefit allocation.",
          "Sponsored opportunities.",
          "Performance evaluation.",
          "Financial opportunities.",
          "Partner status.",
          "Business collaborations.",
        ],
      },
      {
        type: "p",
        text: "All decisions will be made considering the overall interests, financial position, operational requirements and long-term growth of YCC.",
      },
    ],
  },
  {
    title: "21. Acknowledgement",
    blocks: [
      {
        type: "p",
        text: "By participating as a YCC Partner or Co-Partner, the individual confirms that they understand that:",
      },
      {
        type: "ul",
        items: [
          "YCC Partner benefits are opportunities, not guaranteed entitlements.",
          "Benefits may vary between Partners and may depend on performance, availability, financial conditions, operational requirements, project results and Management decisions.",
          "Participation in the Partner Special Tournament does not guarantee any specific benefit, reward, trip, sponsorship or financial return.",
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

export function PartnerTournamentTermsContent() {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide uppercase text-foreground">
          YCC Partner &amp; Co-Partner Program
        </p>
        <p className="font-medium text-foreground">
          Special Tournament — Terms &amp; Conditions
        </p>
        <p>
          These Terms &amp; Conditions apply to all YCC Partners and
          Co-Partners participating in the YCC Partners Special Tournament
          &amp; Partner Events.
        </p>
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
    </div>
  );
}
