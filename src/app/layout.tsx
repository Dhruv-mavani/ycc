import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
        <div className="min-w-0">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
