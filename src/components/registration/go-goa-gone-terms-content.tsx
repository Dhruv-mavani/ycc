// Official Terms & Conditions for YCC Kismat Ke Khiladi, as provided by
// the organizer (October 2026) — replaces the prior September 2026 draft,
// which described an unrelated event structure (Spin the Wheel + Cube
// Challenge + Box Cricket League, a single grand-prize final round) that
// no longer matches the actual game (Level Up: Spin the Wheel + Roll a
// Dice, ₹99 entry, 100-Lucky-Winner-style formula with Lucky/Other Winner
// tiers — see game-plays.ts). Section numbers are generated at render
// time so sections can be added or reordered freely. Rendering shape
// (title + p/ul blocks) matches partner-tournament-terms-content.tsx.

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
    title: "Event Purpose and Participation Fee",
    blocks: [
      {
        type: "p",
        text: "Kismat Ke Khiladi is organised by YCC for entertainment, community building and the expansion of the YCC Club community.",
      },
      {
        type: "p",
        text: "The participation fee of ₹99 includes the following, subject to the applicable terms:",
      },
      {
        type: "ul",
        items: [
          "Participant Registration Certificate.",
          "Participant ID Card.",
          "Participation in Kismat Ke Khiladi, subject to eligibility, the published game rules and applicable law.",
          "YCC Club Membership valid until 31 December 2026.",
          "Access to the YCC Club community and member-specific registration information, announcements and updates.",
          "Early registration opportunities for selected YCC events before general public registration opens, subject to availability and event-specific conditions.",
        ],
      },
      {
        type: "p",
        text: "The ₹99 fee is a participation and membership fee. It does not guarantee any prize, gift, cash reward, event discount or financial return. All inclusions and benefits shall be provided in accordance with the published event details and applicable law.",
      },
    ],
  },
  {
    title: "Eligibility and Age Requirements",
    blocks: [
      {
        type: "p",
        text: "Participation is open to individuals aged 18 to 35 years, inclusive, at the time of registration, open to eligible men and women without discrimination based on gender.",
      },
      {
        type: "p",
        text: "Participants must provide accurate personal information and valid identification documents when required for registration or prize verification. Participants who do not satisfy the age or eligibility requirements may be denied participation or disqualified following verification.",
      },
      {
        type: "p",
        text: "YCC reserves the right to verify a participant's age and identity using appropriate documentation, subject to applicable privacy requirements.",
      },
    ],
  },
  {
    title: "Registration and Payment",
    blocks: [
      {
        type: "p",
        text: "Registration shall be completed through the official registration link or other authorised YCC registration channel, and is considered confirmed only after successful payment verification and confirmation by YCC.",
      },
      {
        type: "p",
        text: "Participants are responsible for providing accurate names, contact details and other required registration information. Each registration is personal to the registered participant and cannot be transferred, sold or assigned to another person without prior written approval from YCC.",
      },
      {
        type: "p",
        text: "YCC may reject or cancel registrations obtained through fraudulent payment methods, false identities, duplicate entries prohibited under the rules or other unauthorised means. Participants must keep their Registration Certificate, Participant ID Card and Game Code, where issued, secure and must not misuse or share them for unauthorised participation.",
      },
    ],
  },
  {
    title: "Refund and Cancellation Policy",
    blocks: [
      {
        type: "p",
        text: "Any refund policy shall be fair, clearly disclosed before payment and consistent with applicable law. The ₹99 fee is not refundable merely because a participant chooses not to participate, except where a refund is required by law or expressly provided in this policy. Nothing in this clause excludes a refund or remedy legally due where the event is cancelled, a material promised service is not provided, or registration/payment fails.",
      },
      { type: "p", text: "Refunds shall ordinarily not be provided for:" },
      {
        type: "ul",
        items: [
          "A participant's personal decision not to participate.",
          "Failure to attend a physical felicitation or prize-collection event, where attendance was clearly required as a lawful and pre-disclosed condition of claiming a particular benefit.",
          "Failure to complete the game due to participant-side internet, device or connectivity issues.",
          "Disqualification resulting from a genuine violation of the published rules.",
          "Failure to claim a benefit or prize within the prescribed claim period, where the claim deadline and consequences were properly communicated.",
        ],
      },
      {
        type: "p",
        text: "In case of duplicate payment, failed registration despite successful payment, or a verified payment-processing error, participants may contact YCC for investigation and appropriate resolution. If YCC cancels the event without providing the advertised participation opportunity or an agreed alternative, appropriate refunds or other remedies shall be provided in accordance with applicable law. Nothing in this section shall restrict any refund or remedy that a participant is legally entitled to receive.",
      },
    ],
  },
  {
    title: "YCC Club Membership",
    blocks: [
      {
        type: "p",
        text: "The YCC Club Membership included in the ₹99 fee is valid only for the calendar year 2026 and shall expire on 31 December 2026. Membership benefits may include:",
      },
      {
        type: "ul",
        items: [
          "Early access to selected YCC event registrations.",
          "Member-exclusive event announcements and updates.",
          "Access to the YCC Club community.",
          "Selected promotional offers and discounts.",
          "Invitations to eligible YCC community activities.",
        ],
      },
      {
        type: "p",
        text: "Early access means an opportunity to register before general public registration opens. It does not guarantee a seat, ticket, registration confirmation or participation in every YCC event.",
      },
      {
        type: "p",
        text: "Membership does not automatically renew and does not guarantee that any particular event, offer, discount or benefit will be available. Any membership extension or renewal beyond 2026 shall be subject to a separate announcement and applicable membership terms.",
      },
    ],
  },
  {
    title: "Game Format and Participation Process",
    blocks: [
      {
        type: "p",
        text: "Kismat Ke Khiladi shall be conducted in accordance with the official event announcement and game rules. The current event format consists of an online qualification/participation stage and, where applicable, a physical felicitation or prize-collection event. The physical event is not a second game unless YCC expressly publishes a revised format before registration and such format is lawful.",
      },
      { type: "p", text: "Round 1: Online Qualification Round" },
      {
        type: "p",
        text: "Participants shall complete Round 1 in accordance with the officially published game instructions, and shall qualify or receive benefits according to the selection and allocation criteria published before registration. Any random selection, random benefit tier or skill/performance-based award must be separately and accurately described.",
      },
      {
        type: "p",
        text: "Qualification for an additional prize does not guarantee a particular benefit unless the published prize schedule expressly states otherwise. Where every participant is promised a base benefit, the rules must clearly distinguish that benefit from additional awards.",
      },
      { type: "p", text: "Physical Felicitation / Prize Collection" },
      {
        type: "p",
        text: "Any physical gathering shall be for felicitation, verification or prize collection only, unless a different format is expressly announced in advance. Qualified participants or winners who are required to attend in person must complete verification and follow instructions issued by authorised YCC representatives.",
      },
      {
        type: "p",
        text: "Travel, accommodation, meals and other personal expenses shall be borne by participants unless YCC expressly announces otherwise in writing. Failure to attend a felicitation or collection event may affect the method or deadline for claiming a benefit only where the applicable claim conditions were clearly disclosed in advance and are lawful. YCC shall communicate any available alternative collection or delivery method, if any.",
      },
      {
        type: "p",
        text: "Before the relevant activity begins, YCC shall publish or communicate the eligibility criteria, selection method, any skill/performance criteria, role of random selection, benefit schedule, participant-count formula, verification process and relevant deadlines.",
      },
    ],
  },
  {
    title: "Winner Categories and Prize Distribution",
    blocks: [
      {
        type: "p",
        text: "The number of award/benefit recipients is variable and is not guaranteed to be a fixed number. Subject to legal review and approval of the event structure before registrations open, the proposed allocation is calculated as a fixed percentage of the final number of eligible, successfully paid and verified registrations recorded by the published registration cut-off. The calculation and allocation method must be published before registration opens and must not be changed retrospectively to the disadvantage of participants.",
      },
      {
        type: "p",
        text: "For this calculation, “eligible registrations” means unique registrations that have been successfully paid, verified and not cancelled, refunded, identified as fraudulent or disqualified under the published rules by the cut-off time. YCC shall retain a record of the count used. Any rounding method, minimum or maximum, and the allocation between benefit categories will be stated clearly in the published schedule before registration opens.",
      },
      {
        type: "ul",
        items: [
          "Lucky Winners — allocation as stated in the pre-published schedule (any random or skill component clearly disclosed): specific exclusive gifts stated in the prize schedule.",
          "Other Winners — allocation as stated in the pre-published schedule (any random or skill component clearly disclosed): complimentary stand-up comedy tickets, subject to the published conditions.",
        ],
      },
      {
        type: "p",
        text: "This formula is a proposed transparent allocation method, not a statement that the event or prize mechanism is legally authorised. YCC must obtain appropriate legal advice on the proposed paid-entry and reward structure before launching it. If the structure is not lawful, YCC must not operate it merely by relying on this clause.",
      },
      {
        type: "p",
        text: "The number of recipients in each category shall be determined by the formula and allocation schedule published before registration opens. YCC shall state the nature, quantity, description and, where relevant, approximate retail value of each advertised benefit, together with eligibility and claim conditions.",
      },
      {
        type: "p",
        text: "Recipients allocated complimentary stand-up comedy tickets shall be eligible for the specified ticket benefit, subject to the applicable event, ticket category, claim deadline and conditions disclosed before registration. Ticket availability must not be used to arbitrarily withdraw a confirmed benefit. Complimentary tickets are intended for the specified stand-up comedy event or events — they shall not be treated as cash equivalents or as guaranteed admission to any other YCC event.",
      },
      {
        type: "p",
        text: "Any benefit offered to participants who do not receive an additional prize must be described accurately. If every participant is promised a benefit whose type or value depends on a random result, the exact benefit categories, allocation process, quantities or formula, and any minimum guaranteed benefit must be disclosed before payment. YCC must not describe a benefit as guaranteed if it is conditional or depends on chance.",
      },
      {
        type: "p",
        text: "Discounted tickets offered to participants who do not qualify for the principal prizes are separate promotional benefits and shall not be represented as guaranteed prizes. Registration, payment, membership or participation alone does not guarantee an additional prize or a particular benefit tier. Any base benefit expressly guaranteed to every participant in the pre-published benefit schedule shall be provided in accordance with that schedule.",
      },
      {
        type: "p",
        text: "YCC shall communicate the recipient-count formula, benefit categories, selection criteria, any random element, performance/scoring criteria, tie-break method and material prize conditions before registration opens and before the relevant selection process begins. Material terms shall not be changed retrospectively to the disadvantage of registered participants.",
      },
      {
        type: "p",
        text: "If the registration count is lower or higher than anticipated, the number of recipients shall be determined only by the pre-published formula and the accompanying benefit schedule. YCC shall not decide the number after seeing the result or reduce the allocation through an unpublished discretionary decision.",
      },
      {
        type: "p",
        text: "The benefit schedule must state how fractional results are rounded, how any remainder is allocated, and whether any minimum or maximum applies. If no rounding or remainder rule was published before registration opened, YCC shall not invent one after registration closes; it shall seek legal advice and provide a fair, lawful resolution consistent with participant-facing promises.",
      },
      {
        type: "p",
        text: "Random allocation of a benefit and selection based on skill/performance are separate mechanisms. The official rules shall identify which mechanism applies to each benefit and explain how the mechanisms interact. A result must not be described as skill-based if chance materially determines it, or as entirely random if skill materially affects it.",
      },
    ],
  },
  {
    title: "Stand-Up Comedy Tickets and Other Event Benefits",
    blocks: [
      {
        type: "p",
        text: "Eligible participants may receive complimentary or discounted tickets to selected YCC stand-up comedy shows, music festivals, concerts or other events. Discounts of up to 30–50%, where expressly announced, shall apply only to eligible events, ticket categories or participants. The actual discount, ticket quantity, event date, validity and availability shall be specified in the applicable offer.",
      },
      {
        type: "p",
        text: "A discount described as “up to 30–50%” does not mean every participant will receive that discount or that the discount applies to every YCC event. Benefits may depend on event capacity, ticket availability, event revenue, operational arrangements, eligibility criteria and the terms of the relevant offer.",
      },
      {
        type: "p",
        text: "Complimentary tickets and discounted tickets shall not be transferable, resold or exchanged for cash unless expressly permitted by YCC in writing. YCC shall not withdraw a confirmed benefit arbitrarily — where a confirmed benefit becomes unavailable due to genuine circumstances, YCC shall communicate the available replacement, rescheduling or other appropriate remedy, subject to applicable law.",
      },
    ],
  },
  {
    title: "Fair Play and Prohibited Activities",
    blocks: [
      {
        type: "p",
        text: "Participants must follow the official game instructions, eligibility requirements, selection procedures and other published rules. Participants shall not:",
      },
      {
        type: "ul",
        items: [
          "Use bots, automated scripts or unauthorised software to manipulate the game.",
          "Interfere with the game mechanism, results, registration records or selection process.",
          "Submit multiple entries where prohibited by the rules.",
          "Use another participant's identity, registration details or Game Code without authorisation.",
          "Engage in fraud, collusion, result manipulation or other dishonest conduct.",
          "Misrepresent their eligibility or attempt to obtain a prize through false information.",
        ],
      },
      {
        type: "p",
        text: "Any result or prize claim may be subject to verification of identity, eligibility, registration and compliance with the game rules. YCC shall apply the published game and selection rules consistently and communicate material changes before implementation, wherever reasonably practicable.",
      },
    ],
  },
  {
    title: "Winner Verification and Prize Collection",
    blocks: [
      {
        type: "p",
        text: "Winners must complete the verification and prize-claim process within the deadline announced by YCC. YCC may request reasonable documents to verify a winner's identity, age, registration, payment and eligibility, subject to applicable privacy requirements.",
      },
      {
        type: "p",
        text: "Winners shall follow the collection or delivery instructions communicated by YCC. Where physical attendance, a winners' meetup or a prize distribution ceremony is required, YCC shall communicate the relevant date, venue and reporting requirements.",
      },
      {
        type: "p",
        text: "Failure to complete verification or claim a prize within the prescribed deadline may result in forfeiture, provided the deadline and consequences were properly disclosed and the forfeiture is lawful. YCC shall maintain reasonable records of winner selection and prize distribution.",
      },
    ],
  },
  {
    title: "Disqualification and Misconduct",
    blocks: [
      {
        type: "p",
        text: "YCC may suspend, reject or disqualify a participant where there are reasonable grounds to believe that the participant has:",
      },
      {
        type: "ul",
        items: [
          "Violated these Terms & Conditions or the published game rules.",
          "Provided fraudulent, misleading or unauthorised information.",
          "Manipulated or attempted to manipulate the game or selection process.",
          "Interfered with event operations or the rights of other participants.",
          "Engaged in unlawful, abusive, threatening or disruptive conduct.",
        ],
      },
      {
        type: "p",
        text: "Where reasonably practicable, YCC shall inform the participant of the alleged violation and provide an opportunity to respond before taking a final adverse decision. Disqualification shall be proportionate to the nature and seriousness of the violation and shall not be used to deny an otherwise valid entitlement arbitrarily. Where disqualification results in the loss of a prize, YCC shall document the relevant grounds and communicate the decision to the affected participant.",
      },
    ],
  },
  {
    title: "Event Postponement, Modification and Cancellation",
    blocks: [
      {
        type: "p",
        text: "YCC may modify the event schedule, venue, format or operational arrangements where reasonably necessary due to technical failures, venue restrictions, safety concerns, regulatory requirements or circumstances beyond its reasonable control. Material changes shall be communicated through the official YCC website, Instagram account, registered contact details or other appropriate channels.",
      },
      {
        type: "p",
        text: "If the event is postponed or materially altered — including a change to the benefit schedule, recipient-count formula, selection process or material game rules — YCC shall communicate the revised arrangements and applicable refund, rescheduling or alternative-benefit policy. YCC shall not use this clause to change the recipient-count formula or reduce advertised benefits retrospectively, except where a change is legally required and handled in accordance with applicable law.",
      },
      {
        type: "p",
        text: "If the event is cancelled without providing the advertised participation opportunity or an agreed alternative, appropriate refunds or other remedies shall be provided in accordance with applicable law. Nothing in this section permits YCC to avoid any mandatory legal obligation owed to participants.",
      },
    ],
  },
  {
    title: "Participant Conduct and Responsibilities",
    blocks: [
      {
        type: "p",
        text: "Participants shall behave respectfully towards YCC representatives, event partners, other participants and venue personnel, and must follow venue safety rules, security instructions and lawful directions issued by authorised event personnel.",
      },
      {
        type: "p",
        text: "Participants shall not misuse the YCC name, logo, certificates, Participant ID Cards or Game Codes for fraudulent, misleading or unauthorised commercial purposes, and are responsible for ensuring that their registration information and contact details remain accurate.",
      },
      {
        type: "p",
        text: "Any damage caused to venue property or event equipment through a participant's unlawful or negligent conduct may be addressed in accordance with applicable law.",
      },
    ],
  },
  {
    title: "Privacy and Use of Participant Information",
    blocks: [
      {
        type: "p",
        text: "YCC may collect and process participant information, including names, contact details, registration information, payment confirmations and game-related records, for registration, membership administration, event operations, winner verification, communication and legal compliance. Participant information shall be handled in accordance with YCC's published Privacy Policy and applicable data protection laws.",
      },
      {
        type: "p",
        text: "Personal information shall not be used for unrelated purposes or disclosed to third parties except as permitted by applicable law, the published Privacy Policy or valid consent. Photographs, videos, testimonials or other identifiable participant content may be used for event publicity in accordance with applicable law and relevant consent or notice requirements.",
      },
      {
        type: "p",
        text: "Participants may contact YCC through its official support channel for privacy-related questions or requests.",
      },
    ],
  },
  {
    title: "Intellectual Property",
    blocks: [
      {
        type: "p",
        text: "The YCC name, logo, event branding, original game content, promotional materials, certificates and associated intellectual property are owned by YCC or used with appropriate authorisation. Participants may use their own Registration Certificates and Participant ID Cards for personal identification and participation-related purposes.",
      },
      {
        type: "p",
        text: "Participants shall not reproduce, commercially exploit, modify or misrepresent YCC intellectual property without prior written permission, except where permitted by law.",
      },
    ],
  },
  {
    title: "Legal Compliance and Organiser's Rights",
    blocks: [
      {
        type: "p",
        text: "YCC reserves the right to enforce these Terms & Conditions and the official game rules through appropriate lawful measures. Where a participant engages in fraud, unauthorised interference, harassment, threats, intellectual property infringement or other unlawful conduct, YCC may issue notices, seek clarification, consult legal counsel, suspend participation or pursue appropriate legal remedies.",
      },
      {
        type: "p",
        text: "Any legal action or enforcement measure shall be undertaken in accordance with applicable law and shall be proportionate to the relevant conduct. YCC shall not exercise its rights in an arbitrary, discriminatory or unlawful manner.",
      },
      {
        type: "p",
        text: "Nothing in these Terms & Conditions shall exclude or limit any liability that cannot lawfully be excluded or limited, or restrict any statutory rights or remedies available to participants.",
      },
      {
        type: "p",
        text: "YCC shall operate the event, including any paid-entry, random allocation, skill/performance contest, prize or benefit mechanism, only after reviewing the structure for compliance with applicable central and state laws and obtaining any legally required approval, licence or advice. These Terms & Conditions do not declare or guarantee that any particular game, draw or prize mechanism is lawful, and cannot override applicable law.",
      },
      {
        type: "p",
        text: "Promotional material and registration pages must accurately describe the participation fee, the guaranteed inclusions, any benefit whose type or value depends on chance, and any additional performance-based awards. The event shall not be described as entirely skill-based if chance materially affects a result, or as entirely random if skill materially affects it.",
      },
    ],
  },
  {
    title: "Grievance Redressal",
    blocks: [
      {
        type: "p",
        text: "Participants may submit complaints or queries relating to registration, payment, membership, game results, prizes, tickets or event administration through the following official contact details:",
      },
      {
        type: "ul",
        items: [
          "Organiser Legal Name: YCC",
          "Contact Email: contact@ycct10.in",
          "Grievance Officer: Abhishek N. Chaudhari",
          "Official Website: https://www.ycct10.in",
        ],
      },
      {
        type: "p",
        text: "Participants should include their registration details, relevant payment reference and a description of the issue when submitting a grievance. YCC shall endeavour to review and respond to grievances within a reasonable period, subject to the nature and complexity of the matter.",
      },
      {
        type: "p",
        text: "If a grievance remains unresolved, participants may approach the appropriate consumer forum, regulatory authority or other competent legal body in accordance with applicable law.",
      },
    ],
  },
  {
    title: "Governing Law and Dispute Resolution",
    blocks: [
      {
        type: "p",
        text: "These Terms & Conditions shall be governed by the applicable laws of India, and any disputes arising from the event shall be addressed in accordance with applicable Indian law.",
      },
      {
        type: "p",
        text: "Courts having appropriate territorial and subject-matter jurisdiction in Surat, Gujarat, may have jurisdiction where legally permissible. Nothing in this clause shall restrict a participant's right to approach a competent consumer forum or other legally authorised authority.",
      },
    ],
  },
  {
    title: "Amendments and Official Announcements",
    blocks: [
      {
        type: "p",
        text: "YCC may update these Terms & Conditions where necessary to reflect operational requirements, legal compliance or material event changes. Material amendments affecting payment conditions, eligibility, game mechanics, selection method, recipient-count formula, prizes or participant rights shall be communicated before they apply.",
      },
      {
        type: "p",
        text: "No amendment shall retrospectively reduce a registered participant's material entitlement or alter the published recipient-count formula to the participant's disadvantage, except where required by law and handled in accordance with applicable law.",
      },
      {
        type: "p",
        text: "Participants shall be governed by the Terms & Conditions applicable to their confirmed registration, subject to lawful amendments and mandatory statutory rights. Specific prize announcements, eligibility requirements and game rules shall form part of these Terms & Conditions when properly published and communicated to participants.",
      },
    ],
  },
  {
    title: "Participant Acknowledgement",
    blocks: [
      {
        type: "p",
        text: "By completing registration and payment, the participant acknowledges that:",
      },
      {
        type: "ul",
        items: [
          "The participation fee includes the expressly stated registration and membership inclusions.",
          "Membership is valid only until 31 December 2026.",
          "Online qualification, benefit allocation and any performance-based awards are subject to the game rules and benefit schedule published before registration.",
          "The number of recipients and allocation between benefit categories are determined by the formula and schedule published before registration, and are not necessarily a fixed number.",
          "The participant has been informed whether a benefit is guaranteed or whether its type/value depends on random selection, and whether any additional award is determined by skill/performance.",
          "Partial winners and unsuccessful participants may receive discounted tickets or other offers, subject to availability.",
          "Participation does not guarantee an additional prize or a particular benefit tier, except for any base benefit expressly guaranteed to every participant in the published schedule.",
          "The participant has reviewed the event rules, refund policy and applicable Terms & Conditions.",
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
          YCC Presents: Kismat Ke Khiladi
        </p>
        <p className="font-medium text-foreground">Official Terms &amp; Conditions</p>
        <ul className="list-none space-y-0.5 text-xs">
          <li>Organiser: YCC</li>
          <li>Event Name: Kismat Ke Khiladi</li>
          <li>Event Category: Game and YCC Club Membership</li>
          <li>Participation Fee: ₹99 per participant</li>
          <li>Membership Validity: 31 December 2026</li>
          <li>Eligibility: Men and women aged 18 to 35 years</li>
          <li>Official Website: https://www.ycct10.in</li>
          <li>Contact Email: contact@ycct10.in</li>
          <li>Grievance Officer: Abhishek N. Chaudhari</li>
        </ul>
        <p>
          These Terms &amp; Conditions govern registration, participation, membership,
          game conduct, winner selection, prize distribution and other benefits
          associated with Kismat Ke Khiladi. By registering for the event and
          completing the payment, participants acknowledge that they have read and
          understood these Terms &amp; Conditions and the applicable game rules.
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
        <p>Event: Kismat Ke Khiladi</p>
        <p>Contact: contact@ycct10.in</p>
        <p>Last Updated: October 2026</p>
      </div>
    </div>
  );
}
