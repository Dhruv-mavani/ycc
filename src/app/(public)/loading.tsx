import { PageSpinner } from "@/components/site/page-spinner";

// Full-viewport height so the footer (which lives in the shared layout
// and renders immediately) starts below the fold. With a short spinner the
// footer was visible in the first paint, then got pushed thousands of
// pixels down when the real page streamed in — counted as a 0.4 layout shift.
export default function Loading() {
  return <PageSpinner className="min-h-[100svh]" />;
}
