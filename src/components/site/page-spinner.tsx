import Image from "next/image";

export function PageSpinner({
  className = "min-h-[60vh]",
}: {
  className?: string;
}) {
  return (
    <div className={`flex w-full items-center justify-center px-4 ${className}`}>
      <div className="relative flex w-full max-w-xs items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl animate-pulse" />
        <Image
          src="/brand/hero-image-v5.png"
          alt="Loading"
          width={1641}
          height={620}
          className="relative w-full h-auto object-contain animate-logo-breathe"
          priority
        />
      </div>
    </div>
  );
}
