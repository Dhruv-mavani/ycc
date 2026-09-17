"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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
  teamRegistrationSchema,
  type TeamRegistrationInput,
} from "@/lib/validations/registration";
import { CashfreeCheckoutButton } from "@/components/registration/cashfree-checkout-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";
import { GoGoaGoneTermsContent } from "@/components/registration/go-goa-gone-terms-content";

interface CollegeOption {
  id: string;
  name: string;
}

/**
 * Open, no-referral registration for events that don't require going
 * through a YCC Partner/Co-Partner's approved squad — the captain just
 * fills in their own details and adds teammates by name. Companion to
 * TeamRegistrationForm, which stays partner-gated for events flagged
 * `requires_referral`.
 */
export function SelfTeamRegistrationForm({
  eventId,
  eventSlug,
  eventName,
  maxTeamSize,
  feePaise,
  payAtVenue = false,
  gstExempt = false,
  colleges,
}: {
  eventId: string;
  /** Only used to scope event-specific one-off UI, e.g. the Go Goa Gone
   * T&C checkbox below — not sent to the API. */
  eventSlug?: string;
  eventName: string;
  maxTeamSize: number;
  feePaise: number;
  /** Skips Cashfree entirely — registration confirms immediately and the
   * entry fee is collected in cash at the venue instead. */
  payAtVenue?: boolean;
  /** No GST on top of feePaise — it's the flat total, so the "+ 18% GST"
   * copy is dropped. */
  gstExempt?: boolean;
  colleges: CollegeOption[];
}) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const isGoGoaGone = eventSlug === "ycc-go-goa-gone";
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    amountPaise: number;
    captainName: string;
    captainPhone: string;
  } | null>(null);
  const [captainName, setCaptainName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [extraPlayers, setExtraPlayers] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  // Captain name/WhatsApp/teammate names all live in plain useState and get
  // synced into RHF's single "players" field together (see syncPlayers) —
  // so every keystroke in any one of them revalidates all of them. Without
  // this, e.g. the WhatsApp error would flash on screen the moment you
  // start typing your name, before you've even reached that field. Only
  // show a field's error once the visitor has actually left it (blur) or
  // tried to submit — same "don't yell before they're done typing" rule
  // register()'d fields get for free from RHF's own touched tracking.
  const [captainNameTouched, setCaptainNameTouched] = useState(false);
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const [extraTouched, setExtraTouched] = useState<boolean[]>([]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<TeamRegistrationInput>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      type: "team",
      eventId,
      collegeId: "",
      teamName: "",
      captainEmail: "",
      players: [],
    },
  });

  const seatsAvailable = maxTeamSize - 1; // one seat is always the captain

  function syncPlayers(name: string, phone: string, extras: string[]) {
    setValue(
      "players",
      [
        { name, phone },
        ...extras.filter((n) => n.trim().length > 0).map((n) => ({ name: n.trim() })),
      ],
      { shouldValidate: true },
    );
  }

  function updateCaptainName(value: string) {
    setCaptainName(value);
    syncPlayers(value, whatsapp, extraPlayers);
  }

  function updateWhatsapp(value: string) {
    setWhatsapp(value);
    syncPlayers(captainName, value, extraPlayers);
  }

  function addPlayerSlot() {
    if (extraPlayers.length >= seatsAvailable) return;
    const next = [...extraPlayers, ""];
    setExtraPlayers(next);
    setExtraTouched([...extraTouched, false]);
    syncPlayers(captainName, whatsapp, next);
  }

  function updatePlayerSlot(index: number, value: string) {
    const next = extraPlayers.map((n, i) => (i === index ? value : n));
    setExtraPlayers(next);
    syncPlayers(captainName, whatsapp, next);
  }

  function removePlayerSlot(index: number) {
    const next = extraPlayers.filter((_, i) => i !== index);
    setExtraPlayers(next);
    setExtraTouched(extraTouched.filter((_, i) => i !== index));
    syncPlayers(captainName, whatsapp, next);
  }

  function touchExtraSlot(index: number) {
    setExtraTouched(extraTouched.map((t, i) => (i === index ? true : t)));
  }

  async function onSubmit(values: TeamRegistrationInput) {
    setFormError(null);
    const filledExtras = extraPlayers.filter((n) => n.trim().length > 0);
    if (filledExtras.length !== seatsAvailable) {
      const message = `Add ${seatsAvailable - filledExtras.length} more player${seatsAvailable - filledExtras.length === 1 ? "" : "s"} to complete your squad of ${maxTeamSize}.`;
      setFormError(message);
      toast.error(message);
      return;
    }

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

      // pay_at_venue events skip Cashfree entirely — the registration is
      // already "confirmed" server-side, so send the captain straight to
      // the same success page a paid registration lands on after checkout.
      // That page polls status, finds it already confirmed, and
      // auto-downloads the receipt — no separate UI needed here.
      if (data.confirmed) {
        setRedirecting(true);
        router.push(`/payment/success?registration=${data.registrationId}`);
        return;
      }

      setSubmitted({
        registrationId: data.registrationId,
        amountPaise: data.amountPaise,
        captainName: values.players[0].name,
        captainPhone: values.players[0].phone ?? "",
      });
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  // Fires when zod blocks the submit (e.g. an invalid WhatsApp number, a
  // too-short name) — the inline red text under each field explains which
  // one, but a field can easily be scrolled out of view, so this toast is
  // the always-visible signal that something needs fixing.
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
            prefillName={submitted.captainName}
            prefillEmail={null}
            prefillPhone={submitted.captainPhone}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team details</CardTitle>
          <CardDescription>
            {feePaise === 0 ? (
              "Free entry — no payment required"
            ) : (
              <>
                Entry fee: ₹{(feePaise / 100).toLocaleString("en-IN")} per team
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
                  options={colleges.map((c) => ({ value: c.id, label: c.name }))}
                />
              )}
            />
          </Field>

          <Field
            label="Captain name"
            error={
              (captainNameTouched || isSubmitted)
                ? errors.players?.[0]?.name?.message
                : undefined
            }
          >
            <Input
              value={captainName}
              onChange={(e) => updateCaptainName(e.target.value)}
              onBlur={() => setCaptainNameTouched(true)}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Email ID" error={errors.captainEmail?.message}>
            <Input {...register("captainEmail")} type="email" placeholder="you@example.com" />
          </Field>

          <Field
            label="WhatsApp number"
            error={
              (whatsappTouched || isSubmitted)
                ? errors.players?.[0]?.phone?.message
                : undefined
            }
          >
            <Input
              value={whatsapp}
              onChange={(e) => updateWhatsapp(e.target.value)}
              onBlur={() => setWhatsappTouched(true)}
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
          </Field>

          <Field label="Team name" error={errors.teamName?.message}>
            <Input {...register("teamName")} placeholder="e.g. CK Strikers" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Squad ({extraPlayers.filter((n) => n.trim()).length + 1}/{maxTeamSize})
          </CardTitle>
          <CardDescription>
            Add your {seatsAvailable} teammate{seatsAvailable === 1 ? "" : "s"} by name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {extraPlayers.map((name, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => updatePlayerSlot(index, e.target.value)}
                  onBlur={() => touchExtraSlot(index)}
                  placeholder={`Player ${index + 2} name`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Remove player"
                  onClick={() => removePlayerSlot(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
              {(extraTouched[index] || isSubmitted) &&
              errors.players?.[index + 1]?.name?.message ? (
                <p className="text-destructive text-xs">
                  {errors.players[index + 1]?.name?.message}
                </p>
              ) : null}
            </div>
          ))}
          {extraPlayers.length < seatsAvailable ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addPlayerSlot}
            >
              <Plus className="size-4" /> Add player
            </Button>
          ) : null}
          {formError ? <p className="text-destructive text-xs">{formError}</p> : null}
        </CardContent>
      </Card>

      {isGoGoaGone ? (
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
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting || redirecting || (isGoGoaGone && !agreedToTerms)
        }
      >
        {isSubmitting || redirecting
          ? "Submitting..."
          : payAtVenue
            ? "Register"
            : "Continue to payment"}
      </Button>

      {isGoGoaGone ? (
        <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kismat Ke Khiladi — Terms &amp; Conditions</DialogTitle>
            </DialogHeader>
            <GoGoaGoneTermsContent />
          </DialogContent>
        </Dialog>
      ) : null}
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
