import Link from "next/link";
import Image from "next/image";
import { Trophy, Download, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactModal } from "@/components/site/contact-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What is the YCC Cricket League?",
    answer: "YCC ~ Yuva Champions Cricket is a modern youth-first cricket platform built by the youth, for the youth, delivering exciting tournaments, unforgettable experiences, exclusive rewards, benefits and opportunities to become tomorrow's champions."
  },
  {
    question: "Who can participate?",
    answer: "Anyone meeting the tournament eligibility criteria can participate. Some tournaments may be exclusively for specific group, community, students, while others are open to all."
  },
  {
    question: "How do I register my team?",
    answer: "You can register your team by filling out the online registration form on our website and any other medium like social media, promotional reels, announcement poster or from any Official YCC Partner."
  },
  {
    question: "What tournament formats does YCC organize?",
    answer: "YCC organizes various formats such as Tennis Ball Cricket, Plastic Ball Cricket, Box Cricket and other special editions."
  },
  {
    question: "Where are the matches conducted?",
    answer: "Tournament venues are announced before each event and shared through our website and official social media channels."
  },
  {
    question: "How will I receive match schedules?",
    answer: "Schedules, fixtures, and updates are shared via WhatsApp, Official Instagram Handle, and the official YCC website."
  },
  {
    question: "What happens if a match is affected by bad weather or any other circumstances?",
    answer: "YCC will reschedule or make decisions according to the official tournament rules."
  }
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  return (
    <div>
      <section className="relative z-0 flex flex-col items-center justify-center min-h-[90vh] overflow-hidden pt-32 pb-24 text-center tw-animate-in tw-fade-in tw-slide-in-from-bottom-8 tw-duration-1000">
        <HeroCarousel />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5),transparent_60%)]"></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/10 via-transparent to-background/50"></div>
        
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 z-10 mt-32 sm:mt-48 md:mt-56">
          
          <p className="text-blue-400 font-semibold max-w-3xl text-sm min-[320px]:text-base min-[380px]:text-lg sm:text-xl md:text-2xl leading-relaxed text-center [text-shadow:_0_2px_4px_rgba(0,0,0,1),_0_0_12px_rgba(0,0,0,1)] px-2">
            Register your team for the cricket championship, or enter
            solo for the quiz competition. Fast registration, instant QR-coded
            receipt.
          </p>
          
          <div className="flex flex-col min-[400px]:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 mt-12 sm:mt-20 pt-3 sm:pt-6 w-full max-w-[260px] min-[320px]:max-w-xs min-[400px]:max-w-none mx-auto">
            <Button size="lg" className="w-full min-[400px]:w-auto rounded-full shadow-xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold text-xs min-[320px]:text-sm sm:text-lg px-4 py-4 min-[320px]:px-5 min-[320px]:py-5 sm:px-8 sm:py-7 flex items-center justify-center gap-2 group border border-primary/50" nativeButton={false} render={<Link href="#events">
              <Trophy className="size-3.5 min-[320px]:size-4 sm:size-5 group-hover:scale-110 transition-transform" /> Register Now
            </Link>} />
            <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto rounded-full font-bold text-xs min-[320px]:text-sm sm:text-lg px-4 py-4 min-[320px]:px-5 min-[320px]:py-5 sm:px-8 sm:py-7 flex items-center justify-center gap-2 bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-black transition-colors duration-300 shadow-lg" nativeButton={false} render={<Link href="/receipt">
              <Download className="size-3.5 min-[320px]:size-4 sm:size-5" /> Download Receipt
            </Link>} />
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-80 hidden sm:block">
          <ChevronDown className="size-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </div>
      </section>

      <section id="events" className="mx-auto max-w-5xl px-4 pb-24 scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center">Register Here</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-6 hidden sm:block"></div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {(!events || events.length === 0) && (
              <div className="sm:col-span-2 rounded-xl border border-dashed border-border p-12 text-center bg-muted/30">
                <p className="text-muted-foreground text-lg">
                  No events are open for registration right now. Check back soon.
                </p>
              </div>
            )}
            {events?.map((event) =>
              event.registration_open ? (
                <Card key={event.id} className="overflow-hidden flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-2xl font-bold">{event.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        Open
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1" />
                  <CardFooter className="pt-6 border-t border-border/50">
                    <Button
                      className="w-full"
                      nativeButton={false}
                      render={<Link href={`/events/${event.slug}`}>View details</Link>}
                    />
                  </CardFooter>
                </Card>
              ) : (
                <Card key={event.id} className="overflow-hidden border-dashed border-border/70 bg-card/30 flex flex-col opacity-80">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-2xl font-bold text-muted-foreground">{event.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="whitespace-nowrap bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                      >
                        Coming Soon
                      </Badge>
                    </div>
                    <CardDescription className="text-base mt-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1" />
                  <CardFooter className="pt-6 border-t border-border/50">
                    <Button className="w-full" variant="outline" disabled>
                      View details
                    </Button>
                  </CardFooter>
                </Card>
              ),
            )}
            <Card className="overflow-hidden border-dashed border-border/70 bg-card/30 flex flex-col opacity-80">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl font-bold text-muted-foreground">
                    YCC Regular Cricket Championship 2026
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="whitespace-nowrap bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter className="pt-6 border-t border-border/50">
                <Button className="w-full" variant="outline" disabled>
                  View details
                </Button>
              </CardFooter>
            </Card>
          </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 pb-24 scroll-mt-24">
        <div className="flex flex-col items-center justify-center mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Everything you need to know about the Yuva Champions Cricket events and registration process.
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
          <Accordion className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.question} value={`item-${i}`} className="border-b-border/40">
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors text-base sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-4">
          <p>Still have questions?</p>
          <ContactModal 
            trigger={<Button variant="outline" className="font-semibold shadow-sm rounded-full px-6">Contact Us</Button>} 
          />
        </div>
      </section>
    </div>
  );
}
