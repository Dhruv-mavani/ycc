import Image from "next/image";

export function PageSpinner({
  className = "min-h-[60vh]",
}: {
  className?: string;
}) {
  return (
    <div className={`flex w-full items-center justify-center px-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/25 blur-xl animate-pulse" />
        <Image
          src="/brand/ycc-logo-bgless.png"
          alt="Loading"
          width={80}
          height={80}
          className="relative size-16 object-contain animate-logo-breathe"
          priority
        />
      </div>
    </div>
  );
}
