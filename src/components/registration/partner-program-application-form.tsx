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
  partnerProgramApplicationSchema,
  type PartnerProgramApplicationInput,
} from "@/lib/validations/partner-program";

export function PartnerProgramApplicationForm({
  colleges,
}: {
  colleges: { id: string; name: string }[];
}) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnerProgramApplicationInput>({
    resolver: zodResolver(partnerProgramApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      collegeId: "",
      stream: "",
      semester: "",
      mobile: "",
      instagramHandle: "",
      referredBy: "",
      agreementQ1: "" as PartnerProgramApplicationInput["agreementQ1"],
      agreementQ2: "" as PartnerProgramApplicationInput["agreementQ2"],
      agreementQ3: "" as PartnerProgramApplicationInput["agreementQ3"],
    },
  });

  async function onSubmit(values: PartnerProgramApplicationInput) {
    try {
      const res = await fetch("/api/partner-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not submit application");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanks for applying!</CardTitle>
          <CardDescription>
            We&apos;ve received your application. Our team will reach out to
            you soon.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
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
          <Field label="Stream / Course" error={errors.stream?.message}>
            <Input {...register("stream")} />
          </Field>
          <Field
            label="Semester / Current Year"
            error={errors.semester?.message}
          >
            <Input {...register("semester")} />
          </Field>
          <Field label="Mobile / WhatsApp number" error={errors.mobile?.message}>
            <Input
              {...register("mobile")}
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
          </Field>
          <Field
            label="Instagram handle"
            error={errors.instagramHandle?.message}
          >
            <Input {...register("instagramHandle")} placeholder="yourhandle" />
          </Field>
          <Field
            label="Name of YCC Campus Partner (referred you) — optional"
            error={errors.referredBy?.message}
          >
            <Input {...register("referredBy")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A few quick agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AgreementField
            label="Selected Campus Partners will receive exclusive benefits, incentives, and commission & partner program opportunities based on their work and performance."
            error={errors.agreementQ1?.message}
          >
            <Controller
              control={control}
              name="agreementQ1"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </AgreementField>

          <AgreementField
            label="Do you agree to work with YCC as a campus partner and assisting with all the requirements to promote our campaigns and events on your college campus?"
            error={errors.agreementQ2?.message}
          >
            <Controller
              control={control}
              name="agreementQ2"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </AgreementField>

          <AgreementField
            label={
              'We believe every YCC Campus Partner should actively participate in YCC events and support our initiatives. Quote: Great leaders lead by example, We believe every Founder and Partner should support, use, and represent our services before encouraging others to join.'
            }
            error={errors.agreementQ3?.message}
          >
            <Controller
              control={control}
              name="agreementQ3"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes, Absolutely">
                      Yes, Absolutely
                    </SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </AgreementField>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit application"}
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

function AgreementField({
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
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
