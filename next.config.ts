import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
