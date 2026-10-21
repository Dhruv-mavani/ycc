import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Sign-in failed</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        We couldn&apos;t complete that sign-in. Please try again, or contact
        an admin if the problem continues.
      </p>
      <Button nativeButton={false} render={<Link href="/">Back to home</Link>} />
    </div>
  );
}
