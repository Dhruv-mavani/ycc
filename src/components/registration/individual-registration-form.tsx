"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  individualRegistrationSchema,
  type IndividualRegistrationInput,
} from "@/lib/validations/registration";
import { RazorpayCheckoutButton } from "@/components/registration/razorpay-checkout-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";

export function IndividualRegistrationForm({
  eventId,
  eventName,
  feePaise,
  colleges,
}: {
  eventId: string;
  eventName: string;
  feePaise: number;
  colleges: { id: string; name: string }[];
}) {
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    amountPaise: number;
    name: string;
    phone: string;
  } | null>(null);

  const individualOption = colleges.find((c) => c.name === "Individual");
  const collegeOptions = colleges.filter((c) => c.name !== "Individual");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IndividualRegistrationInput>({
    resolver: zodResolver(individualRegistrationSchema),
    defaultValues: {
      type: "individual",
      eventId,
      collegeId: "",
      name: "",
      phone: "",
    },
  });

  async function onSubmit(values: IndividualRegistrationInput) {
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
        name: values.name,
        phone: values.phone,
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
            prefillName={submitted.name}
            prefillEmail={null}
            prefillPhone={submitted.phone}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            Entry fee: ₹{(feePaise / 100).toLocaleString("en-IN")} + 18% GST
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
                    {collegeOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    {individualOption ? (
                      <SelectItem value={individualOption.id}>
                        Not from a college (Individual)
                      </SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Mobile number" error={errors.phone?.message}>
            <Input
              {...register("phone")}
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" error={errors.age?.message}>
              <Input {...register("age", { valueAsNumber: true })} type="number" inputMode="numeric" />
            </Field>
            <Field label="Gender" error={errors.gender?.message}>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select">
                        {(value: string | null) =>
                          value
                            ? value[0].toUpperCase() + value.slice(1)
                            : "Select"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
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
