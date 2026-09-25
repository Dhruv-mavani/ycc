"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  selfIndividualRegistrationSchema,
  type SelfIndividualRegistrationInput,
} from "@/lib/validations/registration";
import { CashfreeCheckoutButton } from "@/components/registration/cashfree-checkout-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";
import { GoGoaGoneTermsContent } from "@/components/registration/go-goa-gone-terms-content";

interface CollegeOption {
  id: string;
  name: string;
  initials: string;
}

interface CollegeCampusPartnerOption {
  id: string;
  name: string;
  code: string | null;
}

/**
 * One-person entry for Kismat Ke Khiladi ft. Go Goa Gone. Replaces the team
 * form for this event: everyone registers (and plays the games) on their
 * own code instead of a captain registering a squad.
 */
export function GoGoaGoneIndividualForm({
  eventId,
  eventName,
  feePaise,
  payAtVenue = false,
  gstExempt = false,
  colleges,
  collegeCampusPartners,
}: {
  eventId: string;
  eventName: string;
  feePaise: number;
  /** Skips Cashfree — the registration confirms immediately. */
  payAtVenue?: boolean;
  gstExempt?: boolean;
  colleges: CollegeOption[];
  collegeCampusPartners: CollegeCampusPartnerOption[];
}) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    name: string;
    phone: string;
  } | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SelfIndividualRegistrationInput>({
    resolver: zodResolver(selfIndividualRegistrationSchema),
    defaultValues: {
      type: "self_individual",
      eventId,
      collegeId: "",
      name: "",
      phone: "",
      email: "",
      referredByCollegeCampusPartnerId: "",
    },
  });

  async function onSubmit(values: SelfIndividualRegistrationInput) {
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not submit registration");
        return;
      }

      const data = await res.json();

      // pay_at_venue / free events are already confirmed server-side — go
      // straight to the success page, which downloads the receipt.
      if (data.confirmed) {
        setRedirecting(true);
        router.push(`/payment/success?registration=${data.registrationId}`);
        return;
      }

      setSubmitted({
        registrationId: data.registrationId,
        name: values.name,
        phone: values.phone,
      });
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  function onInvalid() {
    toast.error("Please fix the highlighted fields before submitting");
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review & pay</CardTitle>
          <CardDescription>
            {gstExempt ? "No GST on this event" : "18% GST applies at payment"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gstExempt ? null : <GstBreakdown basePaise={feePaise} />}
          <CashfreeCheckoutButton
            registrationId={submitted.registrationId}
            eventName={eventName}
            prefillName={submitted.name}
            prefillEmail={null}
            prefillPhone={submitted.phone}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            {feePaise === 0 ? (
              "Free entry — no payment required"
            ) : (
              <>
                Entry fee: ₹{(feePaise / 100).toLocaleString("en-IN")} per person
                {gstExempt ? "" : " + 18% GST"}
                {payAtVenue ? " — payable in cash at the venue" : ""}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="College" error={errors.collegeId?.message}>
            <Controller
              control={control}
              name="collegeId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Search for your college..."
                  emptyText="No college matches — try a different search."
                  options={colleges.map((c) => ({
                    value: c.id,
                    label: `${c.initials}  •  ${c.name}`,
                  }))}
                />
              )}
            />
          </Field>

          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Your full name" autoComplete="name" />
          </Field>

          <Field label="WhatsApp number" error={errors.phone?.message}>
            <Input
              {...register("phone")}
              inputMode="numeric"
              placeholder="10-digit mobile"
              autoComplete="tel-national"
            />
          </Field>

          <Field label="Email ID (optional)" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>

          <Field
            label="YCC College Campus Partner code"
            error={errors.referredByCollegeCampusPartnerId?.message}
          >
            <Controller
              control={control}
              name="referredByCollegeCampusPartnerId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Search by name or code — leave blank if none"
                  emptyText="No match found."
                  options={collegeCampusPartners.map((p) => ({
                    value: p.id,
                    label: p.name,
                    sublabel: p.code ?? undefined,
                    searchText: p.code ?? undefined,
                  }))}
                />
              )}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5">
        <Checkbox
          id="agreedToTerms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="agreedToTerms" className="font-normal">
          I agree to the{" "}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="font-medium text-primary underline underline-offset-2"
          >
            T&amp;C
          </button>
          <span className="text-destructive"> *</span>
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={isSubmitting || redirecting || !agreedToTerms}
      >
        {isSubmitting || redirecting
          ? "Submitting..."
          : payAtVenue
            ? "Register"
            : "Continue to payment"}
      </Button>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kismat Ke Khiladi — Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <GoGoaGoneTermsContent />
        </DialogContent>
      </Dialog>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
