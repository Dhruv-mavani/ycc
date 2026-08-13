"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#events", label: "Events" },
  { href: "/partner-program", label: "Partner Program" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mobileMenu = mobileOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center sm:hidden">
      <div 
        className="absolute inset-0 bg-background/90 supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md animate-fade-in" 
        onClick={() => setMobileOpen(false)} 
      />
      <nav className="animate-modal-enter relative z-10 flex w-[85%] max-w-sm flex-col items-stretch gap-2 rounded-3xl bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-xl border p-6 text-lg font-medium shadow-2xl">
        <div className="flex w-full items-center justify-between mb-4 pb-4 border-b">
          <Image
             src="/brand/ycc-logo-bgless.png"
             alt="Yuva Champions Cricket"
             width={130}
             height={46}
             className="object-contain"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-full p-2 transition-colors"
          >
            <XIcon className="size-6" />
          </button>
        </div>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-primary hover:bg-muted rounded-xl px-4 py-3 text-center transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>,
    document.body
  ) : null;

  // Close the mobile menu on navigation (this component persists across
  // route changes since it lives in the shared public layout). Adjusting
  // state during render, not in an effect, per React's guidance for
  // resetting state when a prop changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  if (isHome) {
    return (
      <header className="absolute top-0 w-full z-50 px-4 pt-0 pb-2 flex justify-center">
        <div className="w-full max-w-2xl px-4 sm:px-6 pb-4 flex flex-col items-center justify-center gap-0">
          <div className="flex w-full items-center justify-between sm:justify-center -mt-8 sm:-mt-14">
            <Link href="/" className="flex shrink-0 items-center justify-center group z-10 translate-y-2 sm:translate-y-0">
              <div className="transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/brand/ycc-logo-bgless.png"
                  alt="Yuva Champions Cricket"
                  width={250}
                  height={90}
                  className="h-auto w-[160px] object-contain sm:w-[250px]"
                  priority
                />
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="text-primary shrink-0 rounded-md p-2 sm:hidden"
            >
              {mobileOpen ? (
                <XIcon className="size-6" />
              ) : (
                <MenuIcon className="size-6" />
              )}
            </button>
          </div>

          <nav className="relative z-20 hidden sm:flex items-center flex-wrap justify-center gap-2 md:gap-4 text-sm font-semibold -mt-8 sm:-mt-14 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 shadow-2xl">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {mobileMenu}
        </div>
      </header>
    );
  }

  // Inner pages have no hero section to float over — a normal in-flow
  // sticky header avoids overlapping page content.
  return (
    <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/ycc-logo-bgless.png"
            alt="Yuva Champions Cricket"
            width={130}
            height={46}
            className="object-contain"
            priority
          />
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative group text-primary hover:text-blue-500 transition-colors py-0.5",
              )}
            >
              {link.label}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 transition-[width] duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="text-primary shrink-0 rounded-md p-2 sm:hidden"
        >
          {mobileOpen ? (
            <XIcon className="size-6" />
          ) : (
            <MenuIcon className="size-6" />
          )}
        </button>
      </div>

      {mobileMenu}
    </header>
  );
}
