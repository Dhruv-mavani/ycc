import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BackButton } from "@/components/site/back-button";

export function AdminHeader({ adminName }: { adminName: string }) {
  return (
    <header className="bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <BackButton fallbackHref="/admin" label="" className="mr-1 h-8 w-8 p-0 sm:w-auto sm:px-3 sm:py-2" />
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/brand/ycc-logo.jpg"
            alt="YCC"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="hidden min-[360px]:inline text-sm font-semibold">Admin Dashboard</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden text-sm sm:inline">
          {adminName}
        </span>
        <SignOutButton />
      </div>
    </header>
  );
}
