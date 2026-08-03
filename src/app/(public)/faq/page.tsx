import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BackButton } from "@/components/site/back-button";

// Placeholder content — assets/FAQs For YCC Website.sdocx is a Samsung Notes
// export (not a parseable text format). Replace with the real FAQ copy once
// it's available in a readable format (PDF/docx/text).
const FAQS = [
  {
    question: "Who can register for YCC events?",
    answer:
      "YCC is open to college students. Select your college from the dropdown when you register.",
  },
  {
    question: "How do I register my cricket team?",
    answer:
      "Pick the Box Cricket Championship event, select your college, enter a team name, then add your 6 players (name + mobile number each) — the first player is registered as team captain. Complete payment to confirm your spot.",
  },
  {
    question: "Can I register for the quiz individually?",
    answer:
      "Yes — the Quiz Competition is an individual entry. Select your college, enter your name and mobile number, and complete payment to confirm your spot.",
  },
  {
    question: "What happens after I pay?",
    answer:
      "Your receipt — with your unique participant ID(s) and QR code(s) — downloads automatically. Bring it (digital or printed) to the venue for entry verification.",
  },
  {
    question: "I lost my receipt — what do I do?",
    answer:
      "Go to the Re-download Receipt page and enter your unique ID or the mobile number you registered with to download it again.",
  },
  {
    question: "Is the registration fee refundable?",
    answer:
      "Registration fees are generally non-refundable once payment is confirmed. Contact us if you have a special circumstance.",
  },
  {
    question: "How do I contact the organizers?",
    answer: "Call or WhatsApp us at +91 84878 32810.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />
      <h1 className="mb-1 text-2xl font-bold">Frequently asked questions</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Can&apos;t find what you&apos;re looking for? Call us at{" "}
        <a href="tel:+918487832810" className="underline">
          +91 84878 32810
        </a>
        .
      </p>
      <Accordion>
        {FAQS.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
