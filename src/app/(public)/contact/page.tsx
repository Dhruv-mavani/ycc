"use client";

import { useState } from "react";
import { Phone, MessageCircle, Send } from "lucide-react";
import { BackButton } from "@/components/site/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsSubmitting(true);
    setResult("Sending...");

    const formData = new FormData(formElement);
    formData.append("access_key", "7fbed3cd-648b-4ee1-8299-a99e0adb0576");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        setResult("Something went wrong. Please try again.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setResult("Message sent successfully! We'll be in touch.");
        formElement.reset();
      } else {
        setResult(data.message || "Something went wrong.");
      }
    } catch {
      setResult("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="relative mx-auto max-w-3xl px-4 min-[320px]:px-6 pt-10">
        <BackButton className="mb-6 sm:mb-10" />

        <div className="mb-10 sm:mb-14 text-center">
          <h1 className="text-3xl min-[320px]:text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 mb-4">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-sm min-[320px]:text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Have questions about the tournament? Need help with registration? 
            Reach out to our team instantly!
          </p>
        </div>

        {/* Contact Links Grid */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-16">
          <a
            href="tel:+918487832810"
            className="group flex flex-row min-[480px]:flex-col items-center min-[480px]:justify-center gap-4 min-[480px]:gap-3 rounded-2xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-4 min-[320px]:p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="rounded-full bg-blue-100 p-2.5 min-[320px]:p-3 sm:p-4 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
              <Phone className="size-4 min-[320px]:size-5 sm:size-6" />
            </div>
            <div className="text-left min-[480px]:text-center">
              <p className="font-bold text-sm min-[320px]:text-base text-foreground">Call Us</p>
              <p className="text-xs min-[320px]:text-sm text-muted-foreground mt-0.5 font-medium whitespace-nowrap tracking-tight">+91 84878 32810</p>
            </div>
          </a>
          
          <a
            href="https://wa.me/918487832810"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-row min-[480px]:flex-col items-center min-[480px]:justify-center gap-4 min-[480px]:gap-3 rounded-2xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-4 min-[320px]:p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="rounded-full bg-green-100 p-2.5 min-[320px]:p-3 sm:p-4 text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
              <MessageCircle className="size-4 min-[320px]:size-5 sm:size-6" />
            </div>
            <div className="text-left min-[480px]:text-center">
              <p className="font-bold text-sm min-[320px]:text-base text-foreground">WhatsApp</p>
              <p className="text-xs min-[320px]:text-sm text-muted-foreground mt-0.5 font-medium">Chat instantly</p>
            </div>
          </a>

          <a
            href="https://instagram.com/ycct10"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-row min-[480px]:flex-col items-center min-[480px]:justify-center gap-4 min-[480px]:gap-3 rounded-2xl bg-white/60 dark:bg-card/40 backdrop-blur-md border border-border/50 p-4 min-[320px]:p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="rounded-full bg-pink-100 p-2.5 min-[320px]:p-3 sm:p-4 text-pink-600 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 min-[320px]:size-5 sm:size-6">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <path d="M17.5 6.5h.01" />
              </svg>
            </div>
            <div className="text-left min-[480px]:text-center">
              <p className="font-bold text-sm min-[320px]:text-base text-foreground">Instagram</p>
              <p className="text-xs min-[320px]:text-sm text-muted-foreground mt-0.5 font-medium">@ycct10</p>
            </div>
          </a>
        </div>

        {/* Contact Form */}
        <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 min-[320px]:p-8 sm:px-10 text-white">
            <h2 className="text-xl min-[320px]:text-2xl font-bold tracking-tight">Send us a message</h2>
            <p className="mt-1.5 text-sm min-[320px]:text-base text-blue-100/90 font-medium">
              We&apos;ll get back to you within 24 hours.
            </p>
          </div>

          <div className="p-6 min-[320px]:p-8 sm:px-10">
            <form onSubmit={onSubmit} className="flex flex-col gap-5 min-[320px]:gap-6">
              <div className="grid gap-5 min-[320px]:gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-xs min-[320px]:text-sm uppercase tracking-wider font-bold text-foreground/80 ml-1">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Enter your name"
                    className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary focus-visible:ring-offset-2 h-11 min-[320px]:h-12 rounded-xl text-sm min-[320px]:text-base shadow-sm transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mobile" className="text-xs min-[320px]:text-sm uppercase tracking-wider font-bold text-foreground/80 ml-1">Mobile No.</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    placeholder="9876543210"
                    className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary focus-visible:ring-offset-2 h-11 min-[320px]:h-12 rounded-xl text-sm min-[320px]:text-base shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message" className="text-xs min-[320px]:text-sm uppercase tracking-wider font-bold text-foreground/80 ml-1">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="How can we help you today?"
                  rows={5}
                  className="bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl text-sm min-[320px]:text-base resize-none shadow-sm transition-all p-4"
                />
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-12 min-[320px]:h-14 px-8 min-[320px]:px-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm min-[320px]:text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message <Send className="size-4 min-[320px]:size-5" />
                    </span>
                  )}
                </Button>
              </div>

              {result && (
                <div className={`mt-2 p-3 min-[320px]:p-4 rounded-xl text-sm min-[320px]:text-base font-medium text-center transition-all ${
                  result.includes("Successfully") || result.includes("success")
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : result === "Sending..."
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}>
                  {result}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
