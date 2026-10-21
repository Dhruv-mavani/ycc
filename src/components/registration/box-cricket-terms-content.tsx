type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

interface TermsSection {
  title: string;
  blocks: Block[];
}

const SECTIONS: TermsSection[] = [
  {
    title: "1. Registration & Payment",
    blocks: [
      {
        type: "p",
        text: "Registration is mandatory for every team and player participating in the tournament.",
      },
      {
        type: "p",
        text: "A team's registration shall be considered confirmed only after the applicable Team Entry Fee and Player Fee have been paid in full within the prescribed deadline.",
      },
      {
        type: "p",
        text: "The registration and payment deadline is 21 October 2026, unless YCC officially announces an extension.",
      },
      {
        type: "p",
        text: "YCC reserves the right to reject, cancel or refuse any registration that is incomplete, unpaid, fraudulent, duplicated, inaccurate or submitted after the prescribed deadline.",
      },
      {
        type: "p",
        text: "Registration is subject to availability of tournament slots. Submission of registration details or payment does not constitute final confirmation until the registration has been accepted by YCC.",
      },
      {
        type: "p",
        text: "The Captain or authorised Team Representative shall be responsible for submitting accurate and complete information for all registered team members.",
      },
      {
        type: "p",
        text: "Any false, misleading, fraudulent, duplicate or unauthorised registration may result in cancellation and/or disqualification, subject to applicable law and YCC's applicable refund policy.",
      },
    ],
  },
  {
    title: "2. Acceptance of Terms",
    blocks: [
      {
        type: "p",
        text: "By completing registration and/or making payment, the Captain and Player confirm that they have read, understood and voluntarily accepted these Terms & Conditions.",
      },
      {
        type: "p",
        text: "The Captain or Team Representative shall ensure that every member of the team is informed of and agrees to comply with these Terms & Conditions.",
      },
      {
        type: "p",
        text: "Every registered participant agrees to comply with the Tournament Rules, Playing Conditions, Venue Rules, Match Official decisions and reasonable instructions issued by authorised YCC Officials.",
      },
      {
        type: "p",
        text: "Failure to read or understand these Terms & Conditions shall not ordinarily be accepted as a defence for a violation of the applicable rules.",
      },
    ],
  },
  {
    title: "3. Tournament Format",
    blocks: [
      {
        type: "p",
        text: "The tournament shall accommodate up to 200 participating teams.",
      },
      {
        type: "p",
        text: "Each team shall consist of 7 registered players, subject to any officially announced rules regarding substitutes or player replacements.",
      },
      {
        type: "p",
        text: "Each match shall consist of 6 overs, unless the match conditions, venue, weather, safety requirements or other operational circumstances require modification.",
      },
      {
        type: "p",
        text: "The tournament shall be conducted in a 1 vs 1 Direct Knockout format.",
      },
      {
        type: "p",
        text: "The losing team in a knockout match shall be eliminated from the tournament, unless otherwise specified in the official tournament rules.",
      },
      {
        type: "p",
        text: "YCC reserves the right to reasonably modify match timings, fixtures, venues, playing conditions or tournament arrangements where necessary due to operational, venue, weather, safety, administrative or other legitimate circumstances.",
      },
    ],
  },
  {
    title: "4. Player Eligibility & Registration",
    blocks: [
      { type: "p", text: "Only properly registered and eligible players may participate." },
      {
        type: "p",
        text: "A player shall not represent or participate for more than one team unless expressly permitted by YCC.",
      },
      {
        type: "p",
        text: "YCC may require players to provide valid identification or other information for registration and identity verification.",
      },
      {
        type: "p",
        text: "YCC reserves the right to verify player identity and registration information at any stage before or during the tournament.",
      },
      {
        type: "p",
        text: "Any player found using false information, another person's identity, duplicate registration or fraudulent documentation may be removed and/or disqualified. The concerned team may also be subject to disciplinary action.",
      },
      {
        type: "p",
        text: "YCC may refuse or restrict participation where reasonably necessary for reasons relating to eligibility, safety, misconduct, fraud or disruption of the tournament.",
      },
    ],
  },
  {
    title: "5. Reporting Time & Punctuality",
    blocks: [
      {
        type: "p",
        text: "Every team and player must report to the designated venue before the scheduled reporting and/or match time communicated by YCC.",
      },
      {
        type: "p",
        text: "Participants are expected to arrive sufficiently early for player verification, team preparation, warm-up and other required formalities.",
      },
      {
        type: "p",
        text: "A grace period of approximately 5–10 minutes may be permitted at the discretion of the authorised Match Official or YCC Official, depending on the circumstances and tournament schedule.",
      },
      { type: "p", text: "Unauthorised late arrival may result in:" },
      {
        type: "ul",
        items: [
          "an official warning;",
          "a fine of up to ₹500, where applicable;",
          "forfeiture of the scheduled match; and/or",
          "disqualification of the team.",
        ],
      },
      {
        type: "p",
        text: "Where a delay affects the tournament schedule or the ability to conduct the match fairly, the authorised Match Official/YCC Official may declare the match forfeited.",
      },
      {
        type: "p",
        text: "The grace period is discretionary and shall not be treated as an entitlement.",
      },
    ],
  },
  {
    title: "6. Failure to Attend",
    blocks: [
      {
        type: "p",
        text: "If a registered team fails to appear for its scheduled match without prior approval from YCC, the team may be declared absent, forfeit the match and/or be disqualified.",
      },
      {
        type: "p",
        text: "A team that is unable to attend should notify YCC as early as reasonably possible.",
      },
      {
        type: "p",
        text: "Traffic, travel delays, failure to arrange transportation, personal commitments, college/work commitments or other avoidable circumstances shall not automatically entitle a team to postponement or rescheduling.",
      },
      {
        type: "p",
        text: "YCC shall make reasonable efforts to communicate schedules and important updates through its official communication channels. Participants remain responsible for checking such updates.",
      },
    ],
  },
  {
    title: "7. Match Officials & Umpire Decisions",
    blocks: [
      {
        type: "p",
        text: "The appointed Umpire and Match Officials shall have the authority to conduct the match and enforce the applicable Playing Rules.",
      },
      {
        type: "p",
        text: "Decisions made by the Umpire or Match Official during a match shall be final for the purpose of that match, except where an official YCC review or appeal mechanism has been specifically provided.",
      },
      {
        type: "p",
        text: "No player, Captain, Manager, coach, team representative or spectator may threaten, intimidate, abuse, physically confront or improperly influence an Umpire or Match Official.",
      },
      {
        type: "p",
        text: "Repeated arguing, abusive conduct, refusal to follow official instructions or deliberate disruption may result in removal, match forfeiture and/or disqualification.",
      },
      {
        type: "p",
        text: "YCC Officials may intervene whenever reasonably necessary to maintain discipline, safety and the integrity of the tournament.",
      },
    ],
  },
  {
    title: "8. Sportsmanship & Player Conduct",
    blocks: [
      {
        type: "p",
        text: "Every participant is expected to maintain professional conduct, discipline, respect and sportsmanship throughout the tournament.",
      },
      { type: "p", text: "The following conduct is strictly prohibited:" },
      {
        type: "ul",
        items: [
          "Physical fighting or assault;",
          "Threats, intimidation or harassment;",
          "Abusive, obscene or offensive language directed at players, officials, staff or spectators;",
          "Bullying or discriminatory behaviour;",
          "Intentional provocation;",
          "Threatening gestures or conduct;",
          "Deliberate physical contact intended to injure another person;",
          "Cheating or manipulation of match results;",
          "Match-fixing or improper influence;",
          "Unlawful betting or gambling connected with matches;",
          "Damage to venue or tournament property;",
          "Possession or consumption of prohibited substances at the venue; and",
          "Any conduct that may compromise the safety, discipline or integrity of the tournament.",
        ],
      },
      {
        type: "p",
        text: "Depending on the seriousness of the violation, YCC may impose a warning, fine, suspension, removal, match forfeiture, team disqualification and/or permanent ban, subject to applicable law.",
      },
    ],
  },
  {
    title: "9. Fighting, Abuse & Serious Misconduct",
    blocks: [
      {
        type: "p",
        text: "Any physical fight, assault, serious threat, harassment, intentional injury, vandalism or other potentially criminal conduct may result in immediate removal from the venue and tournament.",
      },
      {
        type: "p",
        text: "Where conduct may constitute an offence, YCC reserves the right to contact and/or cooperate with the appropriate law-enforcement authorities.",
      },
      {
        type: "p",
        text: "Where legally permitted or required, YCC may provide relevant information, records, CCTV footage or other evidence to competent authorities.",
      },
      {
        type: "p",
        text: "YCC may permanently ban an individual and/or team from future YCC events following serious misconduct.",
      },
      {
        type: "p",
        text: "Nothing in these Terms & Conditions prevents any participant or affected person from exercising their legal rights under applicable law.",
      },
    ],
  },
  {
    title: "10. Authority of YCC Management",
    blocks: [
      {
        type: "p",
        text: "YCC Management, Tournament Directors, authorised YCC Coordinators, Match Officials, Umpires and authorised event staff shall have the authority reasonably necessary to conduct and manage the tournament.",
      },
      {
        type: "p",
        text: "Participants must comply with reasonable instructions relating to match management, safety, scheduling, venue discipline and tournament administration.",
      },
      {
        type: "p",
        text: "No participant may obstruct, threaten, abuse or interfere with YCC personnel while they are performing their official duties.",
      },
      {
        type: "p",
        text: "YCC may take appropriate disciplinary action against any participant or team that deliberately disrupts tournament operations.",
      },
    ],
  },
  {
    title: "11. Venue Rules & Property",
    blocks: [
      {
        type: "p",
        text: "The tournament may be conducted at a third-party rented or authorised venue that is not owned or operated by YCC.",
      },
      {
        type: "p",
        text: "Every participant must maintain proper hygiene, cleanliness and discipline at the venue.",
      },
      {
        type: "p",
        text: "Participants must not damage, misuse, remove or interfere with venue property, equipment, infrastructure or facilities.",
      },
      {
        type: "p",
        text: "Any participant or team responsible for damage may be required to compensate for the actual and reasonable cost of repair or replacement, subject to applicable law.",
      },
      {
        type: "p",
        text: "Littering, vandalism, unauthorised use of facilities and disruptive behaviour are strictly prohibited.",
      },
      {
        type: "p",
        text: "YCC may seek recovery of reasonable, documented costs resulting from damage caused by a participant or team, where legally permissible.",
      },
    ],
  },
  {
    title: "12. Injury, Medical Conditions & Participation Risk",
    blocks: [
      {
        type: "p",
        text: "Box Cricket is a physical sporting activity and involves inherent risks, including falls, collisions, impact from the ball, muscle injuries, fractures, dehydration and other accidental injuries.",
      },
      {
        type: "p",
        text: "Every participant voluntarily chooses to participate and is responsible for assessing their own fitness and ability to participate safely.",
      },
      {
        type: "p",
        text: "Participants should disclose relevant medical limitations or conditions where disclosure is reasonably necessary for their safety.",
      },
      {
        type: "p",
        text: "Participants may obtain appropriate personal medical or accident insurance at their own discretion.",
      },
      {
        type: "p",
        text: "YCC shall take reasonable event-management and safety precautions; however, YCC cannot guarantee that accidents, injuries or medical emergencies will not occur.",
      },
      {
        type: "p",
        text: "In the event of an injury or medical emergency, YCC may facilitate reasonable first-aid or emergency assistance and may contact emergency services or the participant's emergency contact where appropriate.",
      },
      {
        type: "p",
        text: "Participants shall ordinarily be responsible for their own medical expenses, except where applicable law provides otherwise or YCC has expressly agreed otherwise in writing.",
      },
      {
        type: "p",
        text: "A participant should not participate if they are medically unfit or have been advised not to participate in physical activity.",
      },
    ],
  },
  {
    title: "13. Travel to & From the Venue",
    blocks: [
      {
        type: "p",
        text: "Participants are responsible for arranging and bearing the cost of their own transportation to and from the tournament venue unless YCC expressly provides otherwise.",
      },
      {
        type: "p",
        text: "Subject to applicable law, YCC shall not be responsible for ordinary travel delays, traffic congestion, vehicle breakdowns or participant-controlled transportation arrangements.",
      },
      {
        type: "p",
        text: "Participants must plan their travel sufficiently in advance to arrive before the required reporting time.",
      },
    ],
  },
  {
    title: "14. Weather, Venue & Unforeseen Circumstances",
    blocks: [
      {
        type: "p",
        text: "YCC may postpone, reschedule, suspend, shorten, relocate or modify a match or tournament where reasonably necessary due to:",
      },
      {
        type: "ul",
        items: [
          "Adverse weather;",
          "Unsafe playing conditions;",
          "Venue restrictions or unavailability;",
          "Power or infrastructure failure;",
          "Government restrictions or directions;",
          "Public emergencies;",
          "Natural disasters;",
          "Law-and-order situations;",
          "Technical or operational failures; or",
          "Other circumstances beyond YCC's reasonable control.",
        ],
      },
      {
        type: "p",
        text: "YCC shall make reasonable efforts to communicate material changes through its official communication channels.",
      },
      {
        type: "p",
        text: "Any revised schedule, venue or playing condition officially announced by YCC shall be applicable to the participating teams and players.",
      },
    ],
  },
  {
    title: "15. Refund & Cancellation Policy",
    blocks: [
      {
        type: "p",
        text: "Registration fees shall generally be non-refundable once registration has been confirmed, except where YCC expressly announces otherwise or a refund is required under applicable law.",
      },
      { type: "p", text: "No refund shall ordinarily be payable due to:" },
      {
        type: "ul",
        items: [
          "Voluntary withdrawal;",
          "Failure to attend;",
          "Late arrival;",
          "Match forfeiture;",
          "Disqualification due to misconduct;",
          "Failure to comply with tournament rules; or",
          "Personal circumstances preventing participation.",
        ],
      },
      {
        type: "p",
        text: "If YCC cancels the tournament entirely, YCC shall communicate the applicable refund or adjustment policy based on the circumstances.",
      },
      {
        type: "p",
        text: "Where a refund is applicable, reasonable payment-processing or administrative deductions may be made where legally permissible and properly disclosed.",
      },
    ],
  },
  {
    title: "16. Fines & Penalties",
    blocks: [
      {
        type: "p",
        text: "YCC may impose reasonable penalties for violations of tournament rules, including applicable late-arrival penalties, misconduct penalties and recovery of property-damage costs.",
      },
      {
        type: "p",
        text: "Any fine or penalty shall be communicated by an authorised YCC Official.",
      },
      { type: "p", text: "Penalties shall be applied reasonably and subject to applicable law." },
      {
        type: "p",
        text: "Imposition of a fine does not prevent YCC from taking additional disciplinary action where the seriousness of the violation warrants it.",
      },
    ],
  },
  {
    title: "17. Anti-Cheating & Fair Play",
    blocks: [
      { type: "p", text: "All teams and players must participate honestly and fairly." },
      {
        type: "p",
        text: "Any attempt to manipulate, predetermine, fix or improperly influence a match or result is strictly prohibited.",
      },
      {
        type: "p",
        text: "Bribery, fraudulent player substitution, identity fraud, deliberate manipulation of results and other forms of cheating may result in immediate disqualification and/or permanent suspension.",
      },
      {
        type: "p",
        text: "Where appropriate, YCC may report suspected fraudulent or criminal activity to the relevant authorities.",
      },
    ],
  },
  {
    title: "18. Betting & Gambling",
    blocks: [
      {
        type: "p",
        text: "Participants, team representatives and officials must not engage in unlawful betting, gambling or match-fixing in connection with YCC matches.",
      },
      {
        type: "p",
        text: "Any participant found attempting to influence a match for betting or gambling purposes may be immediately removed and permanently banned from YCC events.",
      },
      {
        type: "p",
        text: "YCC may cooperate with competent authorities where required by law or reasonably necessary.",
      },
    ],
  },
  {
    title: "19. Photography, Video & Promotional Rights",
    blocks: [
      {
        type: "p",
        text: "YCC and/or its authorised representatives may photograph, record, livestream or otherwise document tournament activities for legitimate event documentation, promotional, marketing, social-media and archival purposes, subject to applicable law.",
      },
      {
        type: "p",
        text: "By participating in the tournament, participants acknowledge that they may appear in event photographs, videos, livestreams or other event-related content.",
      },
      {
        type: "p",
        text: "YCC may use legitimate event-related photographs and recordings for promotional and archival purposes, subject to applicable law.",
      },
    ],
  },
  {
    title: "20. Personal Information & Data",
    blocks: [
      {
        type: "p",
        text: "YCC may collect participant information reasonably required for registration, identity verification, communication, tournament administration, certificates, player identification, scheduling and event management.",
      },
      {
        type: "p",
        text: "Participant information shall be handled in accordance with YCC's applicable Privacy Policy.",
      },
      {
        type: "p",
        text: "Participants must provide accurate information and must not knowingly provide false or unauthorised personal information belonging to another person.",
      },
      {
        type: "p",
        text: "YCC may share necessary participant information with authorised service providers, venue operators, tournament staff or competent authorities where reasonably required for legitimate event administration, safety or legal compliance.",
      },
    ],
  },
  {
    title: "21. Communication & Official Updates",
    blocks: [
      {
        type: "p",
        text: "Participants are responsible for checking YCC's official communication channels for schedules, venue details, match timings, announcements and other tournament updates.",
      },
      {
        type: "p",
        text: "YCC may communicate through its official website, WhatsApp, Instagram, SMS, telephone or other communication channels specified during registration.",
      },
      {
        type: "p",
        text: "Participants must ensure that their contact information provided during registration remains accurate and accessible.",
      },
      {
        type: "p",
        text: "The Captain or Team Representative shall be responsible for communicating important tournament updates to all team members.",
      },
    ],
  },
  {
    title: "22. Changes to Tournament Rules",
    blocks: [
      {
        type: "p",
        text: "YCC reserves the right to reasonably modify playing conditions, schedules, venue arrangements, match timings or administrative procedures where necessary for the safe and efficient conduct of the tournament.",
      },
      {
        type: "p",
        text: "Material changes shall, where reasonably possible, be communicated through official YCC channels.",
      },
      {
        type: "p",
        text: "The latest officially published Tournament Rules and Playing Conditions shall prevail in the event of any inconsistency with an earlier communication.",
      },
    ],
  },
  {
    title: "23. Disqualification",
    blocks: [
      {
        type: "p",
        text: "YCC may disqualify a player and/or team for reasons including, but not limited to:",
      },
      {
        type: "ul",
        items: [
          "Serious misconduct;",
          "Fighting or physical assault;",
          "Abuse, threats or intimidation;",
          "Cheating or fraudulent registration;",
          "Use of an ineligible player;",
          "Identity fraud;",
          "Repeated refusal to follow official instructions;",
          "Match manipulation or fixing;",
          "Serious venue violations;",
          "Deliberate property damage;",
          "Conduct endangering other participants; or",
          "Any other serious violation of tournament rules.",
        ],
      },
      {
        type: "p",
        text: "A disqualified player or team may be removed from the tournament and may lose eligibility for prizes, benefits, certificates or other tournament privileges, subject to applicable law and the circumstances of the violation.",
      },
    ],
  },
  {
    title: "24. Captain's Responsibility",
    blocks: [
      {
        type: "p",
        text: "The Captain or authorised Team Representative registering the team shall be responsible for ensuring that every team member is informed of these Terms & Conditions.",
      },
      {
        type: "p",
        text: "The Captain shall ensure that all information submitted for the team and its players is accurate.",
      },
      {
        type: "p",
        text: "The Captain shall cooperate with YCC Officials regarding schedules, player verification, discipline and tournament administration.",
      },
      {
        type: "p",
        text: "The Captain shall not be personally liable for the independent unlawful conduct of another player merely because they registered the team. However, the team may be subject to tournament-level disciplinary action where permitted under these Terms.",
      },
    ],
  },
  {
    title: "25. No Guarantee of Playing Time",
    blocks: [
      {
        type: "p",
        text: "Registration does not guarantee a minimum amount of playing time for any individual player.",
      },
      {
        type: "p",
        text: "Actual match participation shall depend upon team selection, eligibility, tournament format, match circumstances and applicable Playing Rules.",
      },
    ],
  },
  {
    title: "26. Prizes & Benefits",
    blocks: [
      {
        type: "p",
        text: "Any prize, reward, coupon, benefit or promotional offer announced by YCC shall be subject to the applicable eligibility criteria and specific terms communicated by YCC.",
      },
      {
        type: "p",
        text: "YCC may verify the identity and eligibility of winners before awarding any prize or benefit.",
      },
      {
        type: "p",
        text: "YCC may withhold or cancel a prize or benefit where there is reasonable evidence of fraud, cheating, duplicate registration, identity manipulation or violation of tournament rules.",
      },
      {
        type: "p",
        text: "Applicable taxes, statutory deductions or reporting requirements relating to prizes shall be handled in accordance with applicable law.",
      },
    ],
  },
  {
    title: "27. Intellectual Property & YCC Brand",
    blocks: [
      {
        type: "p",
        text: "The YCC name, logo, branding, tournament identity, graphics, promotional materials and other intellectual property are owned by or licensed to YCC and/or their respective rights holders.",
      },
      {
        type: "p",
        text: "Participants shall not commercially reproduce, modify, distribute or use YCC's branding, logos or tournament materials without prior written permission.",
      },
    ],
  },
  {
    title: "28. Limitation of Liability",
    blocks: [
      {
        type: "p",
        text: "YCC shall take reasonable measures to conduct the tournament in a safe, organised and professional manner.",
      },
      {
        type: "p",
        text: "To the maximum extent permitted by applicable law, YCC shall not be responsible for losses arising from circumstances beyond its reasonable control.",
      },
      {
        type: "p",
        text: "Nothing in these Terms & Conditions shall be interpreted as excluding or limiting any liability that cannot lawfully be excluded or limited under applicable Indian law.",
      },
    ],
  },
  {
    title: "29. Governing Law & Jurisdiction",
    blocks: [
      {
        type: "p",
        text: "These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of India.",
      },
      {
        type: "p",
        text: "Any dispute relating to the tournament should first be brought to the attention of YCC Management for good-faith resolution.",
      },
      {
        type: "p",
        text: "Subject to applicable law, courts having appropriate jurisdiction in Gujarat, India shall have jurisdiction over disputes relating to the tournament.",
      },
    ],
  },
  {
    title: "30. Final Acceptance",
    blocks: [
      {
        type: "p",
        text: "By registering for the YCC Box Cricket Tournament, the participant and/or Captain confirms:",
      },
      {
        type: "quote",
        text: "I confirm that I have read, understood and accepted the YCC Box Cricket Tournament Terms & Conditions. I agree to comply with the Tournament Rules, Playing Conditions, Venue Rules and all reasonable instructions issued by YCC Management and authorised Match Officials. I understand that violation of these Terms & Conditions may result in penalties, match forfeiture, disqualification, suspension or permanent ban, subject to applicable law.",
      },
      {
        type: "p",
        text: "YCC Management reserves the right to take reasonable and lawful action necessary to maintain the safety, discipline, fairness, professionalism and integrity of the tournament.",
      },
    ],
  },
];

const KEY_FACTS: [string, string][] = [
  ["Format", "6 Overs • 7 Players Per Team"],
  ["Tournament Capacity", "Up to 200 Teams"],
  ["Match Format", "1 vs 1 Direct Knockout"],
  ["Tournament Commencement", "2 November 2026"],
  ["Registration & Payment Deadline", "21 October 2026"],
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
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-2 border-primary/40 pl-3 italic text-foreground/90">
        &ldquo;{block.text}&rdquo;
      </blockquote>
    );
  }
  return <p>{block.text}</p>;
}

export function BoxCricketTermsContent() {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide uppercase text-foreground">
          YCC Box Cricket Tournament
        </p>
        <p className="font-medium text-foreground">Terms &amp; Conditions</p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-lg border border-border bg-muted/40 p-3 text-xs sm:grid-cols-2">
        {KEY_FACTS.map(([label, value]) => (
          <div key={label}>
            <span className="font-semibold text-foreground">{label}:</span> {value}
          </div>
        ))}
      </div>

      <p>
        By registering for and/or participating in the YCC Box Cricket
        Tournament, every Captain, Player, Team Representative, Manager and
        other participant acknowledges that they have read, understood and
        agreed to comply with these Terms &amp; Conditions, the applicable
        Playing Rules, Venue Rules and instructions issued by authorised
        YCC Officials and Match Officials.
      </p>

      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
          <div className="space-y-2">
            {section.blocks.map((block, i) => (
              <BlockContent key={i} block={block} />
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-0.5 border-t border-border pt-4 text-center text-xs font-semibold text-foreground">
        <p>YCC Management</p>
        <p className="font-normal text-muted-foreground">
          YCC — Cricket • Community • Competition
        </p>
      </div>
    </div>
  );
}
