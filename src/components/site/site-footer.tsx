"use client";

import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const message = formData.get("message") as string;

    const text = `Hi YCC Team,\n\nName: ${name}\nMobile: ${mobile}\n\n${message}`;
    
    window.open(`https://wa.me/918487832810?text=${encodeURIComponent(text)}`, "_blank");
    event.currentTarget.reset();
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
          <span className="text-blue-500 font-bold tracking-[0.2em] text-xs uppercase mb-6">Cricket. Communities. Champions.</span>
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
            <input name="name" type="text" required placeholder="Your Name" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
            <input name="mobile" type="tel" required placeholder="Phone Number" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors" />
            <textarea name="message" required placeholder="Your Message" rows={3} className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-5 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
            <button type="submit" className="w-full bg-slate-800 hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/50 border border-transparent text-white font-bold tracking-wide text-sm uppercase rounded-lg px-5 py-4 transition-all duration-300 flex items-center justify-center gap-2 mt-2 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="transition-transform group-hover:scale-110">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              SEND VIA WHATSAPP
            </button>
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
          <Link href="/staff/login" className="text-slate-300 hover:text-white text-sm transition-colors w-fit flex items-center gap-2">
            Staff Login <span className="bg-slate-800 text-[9px] px-1.5 py-0.5 rounded tracking-wider text-slate-300">SECURE</span>
          </Link>
          <Link href="/admin/login" className="text-slate-300 hover:text-white text-sm transition-colors w-fit">Admin Login</Link>
        </div>
        
        <div className="flex flex-col gap-5">
          <h4 className="text-blue-500 font-bold uppercase tracking-[0.15em] text-xs mb-1">Social</h4>
          <a href="https://instagram.com/ycct10" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-sm transition-colors flex items-center justify-between group">
            Instagram <span className="text-slate-600 group-hover:text-white transition-colors">↗</span>
          </a>
          <a href="https://wa.me/918487832810" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-sm transition-colors flex items-center justify-between group">
            WhatsApp <span className="text-slate-600 group-hover:text-white transition-colors">↗</span>
          </a>
        </div>
      </div>

      {/* Absolute Bottom */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] sm:text-xs text-slate-500 font-medium tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} YCC. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
          <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
          <button onClick={scrollToTop} className="hover:text-white transition-colors flex items-center gap-1.5">
            Back To Top 
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
