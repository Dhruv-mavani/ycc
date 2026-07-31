import Link from "next/link";
import Image from "next/image";
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
      <section className="relative z-0 flex flex-col items-center justify-center overflow-hidden pt-56 pb-32 text-center tw-animate-in tw-fade-in tw-slide-in-from-bottom-8 tw-duration-1000">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50 dark:opacity-30"
        >
          <source src="/brand/hero_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.2),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent -z-10"></div>
        
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4">
          <div className="mt-6 mb-2 relative flex w-full max-w-[340px] sm:max-w-lg md:max-w-3xl lg:max-w-5xl justify-center group">
            
            {/* Edge Glow Container (Scaled slightly larger than the logo, sits BEHIND) */}
            <div 
              className="absolute inset-0 z-0 pointer-events-none scale-[1.04] sm:scale-[1.03] blur-[3px] transition-transform duration-500 group-hover:scale-[1.05]"
              style={{
                WebkitMaskImage: 'url(/brand/hero-image-v5.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center'
              }}
            >
              {/* Rotating Light Beam (Darker Blue) */}
              <div className="absolute top-1/2 left-1/2 w-[200%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_75%,#1d4ed8_90%,#3b82f6_100%)] opacity-100"></div>
            </div>
            
            {/* The Actual Logo (Sits ON TOP, opaque, hiding the center of the beam) */}
            <Image 
              src="/brand/hero-image-v5.png" 
              alt="Yuva Champions Cricket" 
              width={1641} 
              height={620} 
              className="relative z-10 w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-transform duration-500 group-hover:scale-[1.02]"
              priority 
            />
            
          </div>
          <p className="text-muted-foreground font-medium max-w-2xl text-base sm:text-lg md:text-2xl leading-relaxed backdrop-blur-sm rounded-xl py-1 px-4 text-center">
            Register your college team for the cricket championship, or enter
            solo for the quiz competition. Fast registration, instant QR-coded
            receipt.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold text-lg px-10 py-7" nativeButton={false} render={<Link href="#events">Register Now</Link>} />
            <Button size="lg" variant="outline" className="rounded-full font-bold text-lg px-10 py-7" nativeButton={false} render={<Link href="/receipt">Download Your Receipt</Link>} />
          </div>
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
            {events?.map((event) => (
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
            ))}
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
              <AccordionItem key={i} value={`item-${i}`} className="border-b-border/40">
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
