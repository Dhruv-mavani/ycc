import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ycct10.in"),
  title: "Yuva Champions Cricket | YCC",
  description:
    "YCC ~ Yuva Champions Cricket is a modern youth-first cricket platform. Register your college team for the cricket championship, or enter solo for the quiz competition.",
  keywords: ["YCC", "Yuva Champions Cricket", "Cricket Tournament", "College Cricket", "Youth Cricket League"],
  openGraph: {
    title: "Yuva Champions Cricket | YCC",
    description: "Join the ultimate youth-first cricket platform. Register your team today!",
    url: "https://www.ycct10.in",
    siteName: "Yuva Champions Cricket",
    images: [
      {
        url: "/brand/ycc-logo-bgless.png",
        width: 1024,
        height: 1024,
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuva Champions Cricket | YCC",
    description: "Join the ultimate youth-first cricket platform. Register your team today!",
    images: ["/brand/ycc-logo-bgless.png"],
  },
  verification: {
    google: "3b6XEEOLm7wKfTTiKtG-ROKFnmLbVRZSr6B0qo-4uVk",
  },
};

// Organization + WebSite structured data — gives AI answer engines
// (Google AI Overviews, ChatGPT/Perplexity/Gemini browsing, etc.) and
// search engines a single authoritative, machine-readable description of
// who YCC is and how to reach it, instead of having to infer it from
// prose. Site-wide since every page benefits from the same entity data.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Yuva Champions Cricket",
  alternateName: "YCC",
  url: "https://www.ycct10.in",
  logo: "https://www.ycct10.in/brand/ycc-logo-bgless.png",
  description:
    "YCC ~ Yuva Champions Cricket is a modern youth-first sports platform running college and open cricket tournaments, quizzes, and promotional games across India.",
  email: "contact@ycct10.in",
  telephone: "+91-84878-32810",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-84878-32810",
    contactType: "customer service",
    email: "contact@ycct10.in",
    areaServed: "IN",
  },
  sameAs: [
    "https://instagram.com/ycct10",
    "https://wa.me/918487832810",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Yuva Champions Cricket",
  alternateName: "YCC",
  url: "https://www.ycct10.in",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Chrome/Safari's native scroll restoration tries to reapply
            whatever scroll offset a URL had before a reload/back-forward
            navigation — in this app that meant refreshing (or navigating
            back to) a page you'd scrolled down on would land you back near
            the bottom instead of the top. beforeInteractive so it takes
            effect before the browser has a chance to restore anything.

            Setting scrollRestoration alone isn't enough on mobile: iOS
            Safari (and some Android WebViews) can still repaint a page from
            its back/forward cache (bfcache) at its old scroll offset
            without re-running this script — the page is a frozen snapshot,
            not a fresh load. The 'pageshow' listener below is what
            actually fires on that bfcache restore (event.persisted is
            true), so it's the one that forces the jump back to top there.
            It also runs on every normal load as a second line of defense,
            in case some mobile browser chrome (URL bar collapsing, a
            streamed-in image) re-applies a stale offset before this
            script's first scrollTo has "stuck". Skips the reset only if
            the URL has a real #hash to scroll to (none currently exist on
            this site, but harmless to respect if one ever does). */}
        <Script id="disable-scroll-restoration" strategy="beforeInteractive">
          {`
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            function __yccResetScroll() {
              if (!window.location.hash) { window.scrollTo(0, 0); }
            }
            __yccResetScroll();
            window.addEventListener('pageshow', __yccResetScroll);
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <div className="min-w-0">{children}</div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
