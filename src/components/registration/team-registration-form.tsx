"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  teamRegistrationSchema,
  type TeamRegistrationInput,
} from "@/lib/validations/registration";
import { RazorpayCheckoutButton } from "@/components/registration/razorpay-checkout-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";

interface ReferrerOption {
  id: string;
  name: string;
  team_code: string | null;
}

type ReferrerType = "campus" | "class";

export function TeamRegistrationForm({
  eventId,
  eventName,
  maxTeamSize,
  feePaise,
  campusPartners,
  classPartners,
}: {
  eventId: string;
  eventName: string;
  maxTeamSize: number;
  feePaise: number;
  campusPartners: ReferrerOption[];
  classPartners: ReferrerOption[];
}) {
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    amountPaise: number;
    captainName: string;
    captainPhone: string;
  } | null>(null);
  const [referrerType, setReferrerType] = useState<ReferrerType | "">("");
  const [referrerId, setReferrerId] = useState("");
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [squadError, setSquadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TeamRegistrationInput>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      type: "team",
      eventId,
      collegeId: "",
      teamName: "",
      players: [],
    },
  });

  const { fields, replace, remove } = useFieldArray({ control, name: "players" });

  const referrerLabel =
    referrerType === "campus"
      ? "YCC Partner"
      : referrerType === "class"
        ? "YCC Co-Partner"
        : "";
  const childLabel =
    referrerType === "campus" ? "Co-Partners" : "Classmate Partners";
  const referrerOptions =
    referrerType === "campus"
      ? campusPartners
      : referrerType === "class"
        ? classPartners
        : [];

  function resetSquad() {
    replace([]);
    setValue("collegeId", "");
    setSquadError(null);
  }

  async function loadSquad(type: ReferrerType, id: string) {
    setLoadingSquad(true);
    setSquadError(null);
    try {
      const res = await fetch(
        `/api/partner-program/squad-source?type=${type}&id=${id}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSquadError(data.error ?? "Could not load this squad");
        replace([]);
        setValue("collegeId", "");
        return;
      }
      setValue("collegeId", data.collegeId, { shouldValidate: true });
      setValue("teamName", `${data.captain.name} — Squad`);
      replace([
        { name: data.captain.name, phone: data.captain.phone },
        ...data.roster.map((r: { name: string; phone: string }) => ({
          name: r.name,
          phone: r.phone,
        })),
      ]);
    } catch {
      setSquadError("Network error — please try again");
    } finally {
      setLoadingSquad(false);
    }
  }

  async function onSubmit(values: TeamRegistrationInput) {
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
        captainPhone: values.players[0].phone,
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
          <RazorpayCheckoutButton
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

  const squadReady = fields.length === maxTeamSize;

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
          <Field label="Are you a YCC Partner or YCC Co-Partner?">
            <Select
              value={referrerType}
              onValueChange={(val) => {
                setReferrerType(val as ReferrerType);
                setReferrerId("");
                resetSquad();
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select one">
                  {(value: string | null) =>
                    value === "campus"
                      ? "YCC Partner"
                      : value === "class"
                        ? "YCC Co-Partner"
                        : "Select one"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus">YCC Partner</SelectItem>
                <SelectItem value="class">YCC Co-Partner</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {referrerType ? (
            <Field
              label={`${referrerLabel}'s name/code`}
              error={errors.collegeId?.message}
            >
              <Select
                value={referrerId}
                onValueChange={(val) => {
                  if (!val) return;
                  setReferrerId(val);
                  loadSquad(referrerType, val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select your ${referrerLabel}`}>
                    {(value: string | null) => {
                      const match = referrerOptions.find((o) => o.id === value);
                      if (!match) return `Select your ${referrerLabel}`;
                      return match.team_code
                        ? `${match.name} (${match.team_code})`
                        : match.name;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {referrerOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                      {r.team_code ? (
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                          {r.team_code}
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {referrerOptions.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No approved {referrerLabel}s found yet.
                </p>
              ) : null}
              {squadError ? (
                <p className="text-destructive text-xs">{squadError}</p>
              ) : null}
            </Field>
          ) : null}

          <Field label="Team name" error={errors.teamName?.message}>
            <Input {...register("teamName")} placeholder="e.g. CK Strikers" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Squad ({fields.length}/{maxTeamSize})
          </CardTitle>
          <CardDescription>
            {loadingSquad
              ? "Loading squad…"
              : fields.length === 0
                ? `Select a ${referrerLabel || "YCC Partner / YCC Co-Partner"} above to load the squad`
                : squadReady
                  ? "Ready to register"
                  : fields.length > maxTeamSize
                    ? `Remove ${fields.length - maxTeamSize} player${fields.length - maxTeamSize === 1 ? "" : "s"} — exactly ${maxTeamSize} required`
                    : `Need ${maxTeamSize - fields.length} more approved ${childLabel} before this squad can register`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field
                  label={
                    index === 0
                      ? `Player ${index + 1} name (Captain)`
                      : `Player ${index + 1} name`
                  }
                  error={errors.players?.[index]?.name?.message}
                >
                  <Input {...register(`players.${index}.name` as const)} />
                </Field>
                <Field
                  label="Mobile number"
                  error={errors.players?.[index]?.phone?.message}
                >
                  <Input
                    {...register(`players.${index}.phone` as const)}
                    inputMode="numeric"
                    placeholder="10-digit mobile"
                  />
                </Field>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {fields.length === 0 && !loadingSquad ? (
            <p className="text-muted-foreground text-sm">
              No players yet — pick a YCC Partner or YCC Co-Partner above to
              load their squad.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || loadingSquad || !squadReady}
      >
        {isSubmitting
          ? "Submitting..."
          : squadReady
            ? "Continue to payment"
            : `Squad must have exactly ${maxTeamSize} players`}
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
