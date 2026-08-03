"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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

export function TeamRegistrationForm({
  eventId,
  eventName,
  minTeamSize,
  maxTeamSize,
  feePaise,
  colleges,
}: {
  eventId: string;
  eventName: string;
  minTeamSize: number;
  maxTeamSize: number;
  feePaise: number;
  colleges: { id: string; name: string }[];
}) {
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    amountPaise: number;
    captainName: string;
    captainPhone: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamRegistrationInput>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      type: "team",
      eventId,
      collegeId: "",
      teamName: "",
      players: [{ name: "", phone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your college">
                      {(value: string | null) =>
                        colleges.find((c) => c.id === value)?.name ??
                        "Select your college"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Team name" error={errors.teamName?.message}>
            <Input {...register("teamName")} placeholder="e.g. CK Strikers" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Squad ({fields.length}/{maxTeamSize})</CardTitle>
          <CardDescription>
            {minTeamSize === maxTeamSize
              ? `Add exactly ${minTeamSize} players`
              : `Add ${minTeamSize}–${maxTeamSize} players`}
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
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={fields.length >= maxTeamSize}
            onClick={() => append({ name: "", phone: "" })}
          >
            + Add player
          </Button>
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
