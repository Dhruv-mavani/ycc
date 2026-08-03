import Image from "next/image";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function StaffHeader({ staffName }: { staffName: string }) {
  const initials = staffName
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-xl sticky top-0 z-10 border-b border-border/50 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 gap-2">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Link
            href="/staff"
            className="flex items-center gap-2 min-w-0 group"
          >
            <div className="relative shrink-0">
              <Image
                src="/brand/ycc-logo.jpg"
                alt="YCC"
                width={32}
                height={32}
                className="rounded-lg ring-1 ring-border/50 group-hover:ring-primary/30 transition-shadow"
              />
              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-[3px] ring-2 ring-background">
                <ScanLine className="size-2 text-white" />
              </div>
            </div>
            <div className="hidden min-[360px]:flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight leading-tight truncate">
                Staff
              </span>
              <span className="text-[10px] text-muted-foreground font-medium leading-tight hidden sm:block">
                Booth
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Name + Sign Out */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5 border border-border/30">
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">
                {initials}
              </span>
            </div>
            <span className="text-xs font-medium text-foreground/80 max-w-[120px] truncate">
              {staffName}
            </span>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
