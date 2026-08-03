import { Loader2Icon } from "lucide-react";

export function PageSpinner({
  className = "min-h-[60vh]",
}: {
  className?: string;
}) {
  return (
    <div className={`flex w-full items-center justify-center px-4 ${className}`}>
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
