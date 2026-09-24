import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (much smaller than WebP for the hero photos). Next 16 only
    // honours a `quality` prop that appears in this list — anything else is
    // silently coerced to 75.
    formats: ["image/avif", "image/webp"],
    qualities: [55, 75],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // No window.open()/window.opener usage anywhere in this app
          // (Cashfree checkout and Supabase Google OAuth both use
          // same-tab redirects) — safe to isolate the browsing context.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Same intent as X-Frame-Options but the modern, CSP-based
          // mechanism — blocks this site from being framed elsewhere.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
