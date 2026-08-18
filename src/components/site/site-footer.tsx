"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function SiteFooter() {
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#020617] text-blue-50 border-t border-blue-900/50 overflow-hidden font-sans">
      {/* Top Section with Watermark */}
      <div className="relative w-full border-b border-slate-800/50">
        {/* Giant faded watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02] overflow-hidden">
          <span className="text-[12rem] sm:text-[20rem] md:text-[28rem] lg:text-[35rem] font-black text-white leading-none tracking-tighter">
            YCC
          </span>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
        {/* Left: Call to Action */}
        <div className="flex flex-col items-start justify-center">
          <span className="text-blue-500 font-bold tracking-widest min-[360px]:tracking-[0.2em] text-[9px] min-[320px]:text-[10px] min-[360px]:text-xs uppercase mb-6 whitespace-nowrap">Cricket. Communities. Champions.</span>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Ready to<br/>Play?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
            Register your team today and secure your spot in the most exciting youth cricket tournament of the year.
          </p>
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <Link href="/#events" className="w-full sm:w-auto text-center bg-white text-slate-950 font-bold px-8 py-4 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              REGISTER NOW 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <a href="tel:+918487832810" className="w-full sm:w-auto text-center flex items-center justify-center gap-2 border border-slate-800 rounded-xl px-8 py-4 font-bold hover:bg-slate-800/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              CALL US
            </a>
          </div>
        </div>
        
        {/* Right: Contact Form */}
        <div className="lg:border-l lg:border-slate-800 lg:pl-16 flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Contact Us</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Have a question, feedback, or a partnership inquiry? Drop us a message and we&apos;ll get back to you.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label htmlFor="footer-contact-name" className="sr-only">Your Name</label>
            <input id="footer-contact-name" name="name" type="text" required placeholder="Your Name" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
            <label htmlFor="footer-contact-mobile" className="sr-only">Phone Number</label>
            <input id="footer-contact-mobile" name="mobile" type="tel" required placeholder="Phone Number" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
            <label htmlFor="footer-contact-message" className="sr-only">Your Message</label>
            <textarea id="footer-contact-message" name="message" required placeholder="Your Message" rows={3} className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-800 hover:bg-blue-600 disabled:opacity-50 border border-transparent text-white font-bold tracking-wide text-sm uppercase rounded-lg px-5 py-4 transition-colors duration-300 flex items-center justify-center gap-2 mt-2 group">
              {isSubmitting ? "SENDING..." : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  SEND MESSAGE
                </>
              )}
            </button>
            {result && (
              <div className={`mt-2 p-3 rounded-lg text-sm font-medium text-center transition-all ${
                result.includes("successfully") 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : result === "Sending..."
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {result}
              </div>
            )}
          </form>
        </div>
      </div>

      </div>

      {/* Marquee / Divider Band */}
      <div className="relative border-y border-slate-800 bg-[#0f172a]/50 py-5 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee inline-flex gap-8 items-center font-mono text-[11px] tracking-[0.2em] text-slate-400 uppercase">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="inline-flex gap-8 items-center">
              <span>YOUTH FIRST</span> <span className="text-blue-500">+</span>
              <span>COLLEGE CRICKET</span> <span className="text-blue-500">+</span>
              <span>FAIR PLAY</span> <span className="text-blue-500">+</span>
              <span>EXCITING REWARDS</span> <span className="text-blue-500">+</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Links Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8">
        <div className="sm:col-span-2 md:col-span-1 flex flex-col items-start">
          <Link href="/">
            <Image 
              src="/brand/ycc-logo-bgless.png" 
              alt="YCC Logo" 
              width={140} 
              height={50} 
              className="object-contain brightness-0 invert mb-4 hover:opacity-80 transition-opacity"
            />
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">The standard for youth cricket and box cricket leagues.</p>
        </div>
        
        <div className="flex flex-col gap-5">
          <h4 className="text-blue-500 font-bold uppercase tracking-[0.15em] text-xs mb-1">Menu</h4>
          <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Home</Link>
          <Link href="/#events" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Championships</Link>
          <Link href="/receipt" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Download Receipt</Link>
          <Link href="/faq" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">FAQs</Link>
        </div>
        
        <div className="flex flex-col gap-5">
          <h4 className="text-blue-500 font-bold uppercase tracking-[0.15em] text-xs mb-1">Company</h4>
          <Link href="/about" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">About YCC</Link>
          <Link href="/partner-program" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Partner Program</Link>
          <Link href="/staff/login" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Staff Login</Link>
          <Link href="/admin/login" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Admin Login</Link>
        </div>
        
        <div className="flex flex-col gap-5">
          <h4 className="text-blue-500 font-bold uppercase tracking-[0.15em] text-xs mb-1">Social & Contact</h4>
          <a href="mailto:contact@ycct10.in" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">
            Email Us
          </a>
          <a href="https://instagram.com/ycct10" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">
            Instagram
          </a>
          <a href="https://wa.me/918487832810" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">
            WhatsApp
          </a>
        </div>
      </div>

      {/* Absolute Bottom */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs text-slate-500 font-medium tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} YCC. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
          <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
          <button type="button" onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-1.5">
            Back To Top 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
