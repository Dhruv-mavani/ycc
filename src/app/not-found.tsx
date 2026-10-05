import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata = {
  title: "Page Not Found | YCC",
  description: "The page you're looking for doesn't exist or may have moved.",
};

// Root-level not-found.tsx — per Next's own docs (not-found.md, checked
// directly given this project's Next version can differ from training
// data), this one file handles BOTH explicit notFound() calls from any
// route segment AND any URL that doesn't match a route at all (e.g. an
// old/dead link like the discontinued /level-up). It renders inside the
// root layout (fonts, globals.css already applied) but NOT inside the
// (public) route group's layout, so the site header/footer aren't
// inherited automatically — included directly here instead, so a dead
// link still lands on a fully branded, navigable page rather than a bare
// "Not Found" or a dead end.
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col selection:bg-primary/20">
      <div className="absolute inset-x-0 top-0 -z-10 h-screen w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(2,132,199,0.15),rgba(2,132,199,0.04)_55%,rgba(255,255,255,0)_100%)]"></div>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <p className="text-7xl font-extrabold tracking-tight text-slate-900 sm:text-8xl">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-500 sm:text-base">
          The link you followed doesn&apos;t lead anywhere — it may be old,
          mistyped, or the page has been moved or discontinued.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            nativeButton={false}
            render={
              <Link href="/">
                <HomeIcon className="size-4" />
                Back to Home
              </Link>
            }
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
