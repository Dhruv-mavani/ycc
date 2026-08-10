import { requirePartnerOfType } from "@/lib/auth";
import { PartnerHeader } from "@/components/registration/partner-header";
import { WhatsappJoinGate } from "@/components/registration/whatsapp-join-gate";

export default async function ClassmatePartnerPage() {
  const access = await requirePartnerOfType("classmate");

  if (!access.application.whatsappJoinedAt) {
    return (
      <WhatsappJoinGate title="Classmate Partner" partnerName={access.application.name} />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PartnerHeader title="Classmate Partner" partnerName={access.application.name} />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <div className="relative p-6 sm:p-8 flex flex-col gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome, {access.application.name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                You&apos;re an approved YCC Classmate Partner.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
