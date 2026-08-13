"use client";

import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
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
    setResult("Sending....");

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
        setResult("Form Submitted Successfully!");
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton className="mb-4" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl text-blue-950">Contact Us</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Have a question about the tournament? Drop us a message, or reach us
          directly below.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-10">
        <a
          href="tel:+918487832810"
          className="flex items-center gap-3 rounded-lg border p-4 text-sm hover:bg-muted transition-colors"
        >
          <Phone className="size-4 text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold">Call Us</p>
            <p className="text-muted-foreground">+91 84878 32810</p>
          </div>
        </a>
        <a
          href="https://wa.me/918487832810"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border p-4 text-sm hover:bg-muted transition-colors"
        >
          <MessageCircle className="size-4 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold">WhatsApp</p>
            <p className="text-muted-foreground">Chat instantly</p>
          </div>
        </a>
        <a
          href="https://instagram.com/ycct10"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border p-4 text-sm hover:bg-muted transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-pink-600 shrink-0">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <path d="M17.5 6.5h.01" />
          </svg>
          <div>
            <p className="font-semibold">Instagram</p>
            <p className="text-muted-foreground">@ycct10</p>
          </div>
        </a>
      </div>

      <div className="rounded-xl border border-blue-100 shadow-sm bg-white overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 pb-5 border-b border-blue-100">
          <h2 className="text-lg font-bold text-blue-950">Send us a message</h2>
          <p className="text-gray-600 mt-1 text-sm">
            We&apos;ll get back to you as soon as we can.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-blue-950 text-xs uppercase tracking-wider font-semibold">Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="bg-white border-gray-200 focus-visible:ring-blue-600 text-gray-900 placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile" className="text-blue-950 text-xs uppercase tracking-wider font-semibold">Mobile No.</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className="bg-white border-gray-200 focus-visible:ring-blue-600 text-gray-900 placeholder:text-gray-400 shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message" className="text-blue-950 text-xs uppercase tracking-wider font-semibold">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="How can we help you today?"
                rows={4}
                className="bg-white border-gray-200 focus-visible:ring-blue-600 text-gray-900 placeholder:text-gray-400 resize-none shadow-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors duration-300"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>

            {result && (
              <p className="text-sm text-center font-medium text-blue-600">
                {result}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
