"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Download } from "lucide-react";
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
  individualFreeRegistrationSchema,
  type IndividualFreeRegistrationInput,
} from "@/lib/validations/registration";

interface CollegeOption {
  id: string;
  name: string;
}

// Free, no-payment, individual (no team) registration — submitting
// immediately produces a personalized certificate (code = first 4 letters
// of the name + first 4 digits of the WhatsApp number), auto-downloaded
// the same way the Super Champs certificate is. See
// school-registration-form.tsx for the sibling flow this mirrors.
export function IndividualFreeRegistrationForm({
  eventId,
  eventName,
  colleges,
}: {
  eventId: string;
  eventName: string;
  colleges: CollegeOption[];
}) {
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    code: string;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IndividualFreeRegistrationInput>({
    resolver: zodResolver(individualFreeRegistrationSchema),
    defaultValues: {
      eventId,
      name: "",
      whatsapp: "",
      email: "",
      collegeId: "",
    },
  });

  async function downloadCertificate(id: string) {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/individual-free-registrations/${id}/certificate`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setDownloadError(
          errorData.error ?? "Something went wrong while preparing your certificate. Please try again.",
        );
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? "YCC-Certificate.pdf";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Network error — please check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function onSubmit(values: IndividualFreeRegistrationInput) {
    try {
      const res = await fetch("/api/individual-free-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not submit registration");
        return;
      }

      const data: { registrationId: string; code: string } = await res.json();
      setSubmitted(data);
      void downloadCertificate(data.registrationId);
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You&apos;re in!</CardTitle>
          <CardDescription>
            Registered for {eventName}. Your personal code:{" "}
            <span className="font-bold text-foreground">{submitted.code}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {downloadError ? (
            <p className="text-destructive text-sm">{downloadError}</p>
          ) : null}
          <Button
            className="w-full"
            disabled={downloading}
            onClick={() => downloadCertificate(submitted.registrationId)}
          >
            <Download className="size-4" />
            {downloading ? "Preparing certificate..." : "Download certificate again"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>Free entry — no payment required</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="College" error={errors.collegeId?.message}>
            <Controller
              control={control}
              name="collegeId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Search for your college..."
                  emptyText="No college matches — try a different search."
                  options={colleges.map((c) => ({ value: c.id, label: c.name }))}
                />
              )}
            />
          </Field>

          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Your full name" />
          </Field>

          <Field label="WhatsApp number" error={errors.whatsapp?.message}>
            <Input
              {...register("whatsapp")}
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="you@example.com" />
          </Field>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Register for free"}
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
