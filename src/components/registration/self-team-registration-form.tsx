"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  teamRegistrationSchema,
  type TeamRegistrationInput,
} from "@/lib/validations/registration";
import { CashfreeCheckoutButton } from "@/components/registration/cashfree-checkout-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";

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
  eventName,
  maxTeamSize,
  feePaise,
  colleges,
}: {
  eventId: string;
  eventName: string;
  maxTeamSize: number;
  feePaise: number;
  colleges: CollegeOption[];
}) {
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

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
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
    syncPlayers(captainName, whatsapp, next);
  }

  async function onSubmit(values: TeamRegistrationInput) {
    setFormError(null);
    const filledExtras = extraPlayers.filter((n) => n.trim().length > 0);
    if (filledExtras.length !== seatsAvailable) {
      setFormError(
        `Add ${seatsAvailable - filledExtras.length} more player${seatsAvailable - filledExtras.length === 1 ? "" : "s"} to complete your squad of ${maxTeamSize}.`,
      );
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

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review & pay</CardTitle>
          <CardDescription>18% GST applies at payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GstBreakdown basePaise={feePaise} />
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team details</CardTitle>
          <CardDescription>
            Entry fee: ₹{(feePaise / 100).toLocaleString("en-IN")} per team +
            18% GST
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

          <Field label="Captain name">
            <Input
              value={captainName}
              onChange={(e) => updateCaptainName(e.target.value)}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Email ID" error={errors.captainEmail?.message}>
            <Input {...register("captainEmail")} type="email" placeholder="you@example.com" />
          </Field>

          <Field label="WhatsApp number">
            <Input
              value={whatsapp}
              onChange={(e) => updateWhatsapp(e.target.value)}
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
            <div key={index} className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => updatePlayerSlot(index, e.target.value)}
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Continue to payment"}
      </Button>
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
