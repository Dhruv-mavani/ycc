"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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

// Portals need `document.body`, which doesn't exist during SSR — this
// subscribes to nothing and just reports "mounted" once the client has
// taken over, without the extra mount-effect render pass.
const subscribeNoop = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  // These pages share the floating pill nav look — everything else (admin/
  // staff tools, registration forms, etc.) keeps the plain always-visible bar.
  const hasPillHeader =
    isHome ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/receipt" ||
    pathname.startsWith("/partner-program");
  const [mobileOpen, setMobileOpen] = useState(false);

  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const mobileMenu = mobileOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center min-[380px]:hidden">
      <div
        className="absolute inset-0 bg-background/90 supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md animate-fade-in"
        aria-hidden="true"
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

  // Home floats this over the hero photo (absolute, pulled up tight with
  // negative margins to sit snug against the art). The other pill pages
  // have no photo to float over, so they get the same look sitting in
  // normal flow at the top instead — same nav, no overlap trickery needed.
  return (
    <>
      {hasPillHeader && (
        <header
          className={cn(
            "w-full z-50 px-4 pb-2 flex justify-center",
            isHome ? "absolute top-0 pt-0" : "relative pt-6",
          )}
        >
          <div
            className={cn(
              "w-full max-w-2xl px-4 sm:px-6 pb-4 flex flex-col items-center justify-center gap-0",
              !isHome && "gap-3",
            )}
          >
            <div
              className={cn(
                "relative flex w-full items-center justify-start min-[380px]:justify-center",
                isHome ? "-mt-8 sm:-mt-14 translate-y-2 sm:translate-y-0" : "",
              )}
            >
              <Link href="/" className="flex shrink-0 items-center justify-center group z-10">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/brand/ycc-logo-bgless.png"
                    alt="Yuva Champions Cricket"
                    width={250}
                    height={90}
                    className={cn(
                      "h-auto object-contain",
                      isHome ? "w-[160px] sm:w-[250px]" : "w-[140px] sm:w-[180px]",
                    )}
                    priority={isHome}
                  />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className={cn(
                  "absolute right-0 shrink-0 rounded-md p-2 min-[380px]:hidden",
                  isHome ? "text-primary" : "text-foreground",
                )}
              >
                {mobileOpen ? (
                  <XIcon className="size-6" />
                ) : (
                  <MenuIcon className="size-6" />
                )}
              </button>
            </div>

            <nav
              className={cn(
                "relative z-20 hidden min-[380px]:flex items-center flex-nowrap justify-center whitespace-nowrap gap-0.5 min-[480px]:gap-1 md:gap-4 text-[11px] min-[480px]:text-xs md:text-sm font-semibold bg-black/20 backdrop-blur-xl border border-white/10 rounded-full px-2.5 py-1.5 md:px-6 md:py-2.5 shadow-2xl",
                isHome ? "-mt-8 sm:-mt-14" : "",
              )}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative rounded-full px-1.5 py-1 min-[480px]:px-2.5 min-[480px]:py-1.5 md:px-4 md:py-2 text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
      )}

      {/* No fallback header once the pill scrolls out of view — nav only
          lives in the pill at the top of these pages. */}
      {!hasPillHeader && (
        <header className="z-50 sticky top-0 bg-background/95 border-b backdrop-blur">
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
            <nav className="hidden min-[380px]:flex items-center gap-6 text-sm font-medium">
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
              className="text-primary shrink-0 rounded-md p-2 min-[380px]:hidden"
            >
              {mobileOpen ? (
                <XIcon className="size-6" />
              ) : (
                <MenuIcon className="size-6" />
              )}
            </button>
          </div>
        </header>
      )}
      {mobileMenu}
    </>
  );
}
