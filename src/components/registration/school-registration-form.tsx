"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Download } from "lucide-react";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  schoolRegistrationSchema,
  type SchoolRegistrationInput,
} from "@/lib/validations/registration";

interface SchoolOption {
  id: string;
  name: string;
}

// Free, no-payment, individual registration — submitting immediately
// produces a personalized certificate (code = first 4 letters of the name
// + first 4 digits of the WhatsApp number), auto-downloaded the same way
// the Partner Program certificate is.
export function SchoolRegistrationForm({
  eventId,
  eventName,
  schools,
}: {
  eventId: string;
  eventName: string;
  schools: SchoolOption[];
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
  } = useForm<SchoolRegistrationInput>({
    resolver: zodResolver(schoolRegistrationSchema),
    defaultValues: {
      eventId,
      name: "",
      email: "",
      whatsapp: "",
      instagramHandle: "",
      age: undefined,
      gender: undefined,
      schoolId: "",
    },
  });

  // Fetches the certificate first instead of navigating the browser
  // straight to the API route, so a failure can show a friendly message
  // rather than a bare JSON error page.
  async function downloadCertificate(id: string) {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/school-registrations/${id}/certificate`);
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

  async function onSubmit(values: SchoolRegistrationInput) {
    try {
      const res = await fetch("/api/school-registrations", {
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
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Your full name" />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="you@example.com" />
          </Field>

          <Field label="WhatsApp number" error={errors.whatsapp?.message}>
            <Input
              {...register("whatsapp")}
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
          </Field>

          <Field label="Instagram handle" error={errors.instagramHandle?.message}>
            <Input {...register("instagramHandle")} placeholder="@yourhandle" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" error={errors.age?.message}>
              <Input
                {...register("age", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
              />
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
                          value ? value[0].toUpperCase() + value.slice(1) : "Select"
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

          <Field label="School" error={errors.schoolId?.message}>
            <Controller
              control={control}
              name="schoolId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Search for your school..."
                  emptyText="No school matches — try a different search."
                  options={schools.map((s) => ({ value: s.id, label: s.name }))}
                />
              )}
            />
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
