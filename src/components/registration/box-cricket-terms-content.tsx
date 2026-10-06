type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

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

export function BoxCricketTermsContent() {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide uppercase text-foreground">
          YCC Box Cricket Tournament
        </p>
        <p className="font-medium text-foreground">Terms &amp; Conditions</p>
        <p>
          By registering for and/or participating in the YCC Box Cricket
          Tournament, every Captain, Player, Team Representative, Manager and
          other participant acknowledges that they have read, understood and
          agreed to comply with these Terms &amp; Conditions, the applicable
          Playing Rules, Venue Rules and instructions issued by authorised
          YCC Officials and Match Officials.
        </p>
      </div>

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

      <p className="text-xs italic">
        The full Terms &amp; Conditions (including Player Reporting Time,
        Punctuality and further sections) will be shared separately by YCC
        before the tournament begins.
      </p>
    </div>
  );
}
