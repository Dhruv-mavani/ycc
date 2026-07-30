"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactModal } from "./contact-modal";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#events", label: "Events" },
  { href: "/about", label: "About Us" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <header className="absolute top-0 sm:-top-14 w-full z-50 px-4 pt-4 sm:pt-0 pb-2 flex justify-center transition-all duration-300">
        <div className="w-full max-w-2xl px-4 sm:px-6 pb-4 flex flex-col items-center justify-center gap-0">
          <div className="flex w-full items-center justify-between sm:justify-center">
            <Link href="/" className="flex shrink-0 items-center justify-center group z-10">
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

          <nav className="relative z-20 hidden sm:flex items-center flex-wrap justify-center gap-16 sm:gap-24 text-base font-medium -mt-14">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative group text-primary hover:text-blue-500 transition-colors py-0.5"
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <ContactModal />
          </nav>

          {mobileOpen ? (
            <nav className="bg-background/95 mt-3 flex w-full flex-col items-stretch gap-1 rounded-xl border p-2 text-base font-medium shadow-lg backdrop-blur sm:hidden">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-primary hover:bg-muted rounded-lg px-3 py-2 text-center transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-3 py-2 text-center">
                <ContactModal />
              </div>
            </nav>
          ) : null}
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
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          <ContactModal />
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

      {mobileOpen ? (
        <nav className="flex flex-col items-stretch gap-1 border-t px-2 py-2 text-sm font-medium sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-primary hover:bg-muted rounded-lg px-3 py-2 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="px-3 py-2">
            <ContactModal />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
