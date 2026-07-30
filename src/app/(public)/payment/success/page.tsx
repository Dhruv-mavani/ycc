import { PaymentStatusPoller } from "@/components/registration/payment-status-poller";
import { BackButton } from "@/components/site/back-button";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ registration?: string }>;
}) {
  const { registration } = await searchParams;

  if (!registration) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">
          Missing registration reference.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <BackButton className="mb-4 self-start" />
      <PaymentStatusPoller registrationId={registration} />
    </div>
  );
}
