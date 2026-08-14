"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackButton } from "@/components/site/back-button";
import {
  partnerCertificateLookupSchema,
  type PartnerCertificateLookupInput,
} from "@/lib/validations/partner-program";

export default function PartnerCertificateLookupPage() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnerCertificateLookupInput>({
    resolver: zodResolver(partnerCertificateLookupSchema),
    defaultValues: { mobile: "" },
  });

  async function onSubmit(values: PartnerCertificateLookupInput) {
    setFormError(null);
    try {
      const res = await fetch("/api/partner-program/certificate/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message: string =
          errorData.error ?? "Could not find your certificate";
        setFormError(message);
        toast.error(message);
        return;
      }

      const data = await res.json();
      window.location.assign(
        `/api/partner-program/certificate/${data.applicationId}/download`,
      );
    } catch {
      const message = "Network error — please check your connection and try again";
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <BackButton className="mb-4 self-start" />
      <Card>
        <CardHeader>
          <CardTitle>Re-download your certificate</CardTitle>
          <CardDescription>
            For YCC Partners and YCC Co-Partners. Enter the mobile number you
            applied with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mobile number</Label>
              <Input
                {...register("mobile", {
                  onChange: () => setFormError(null),
                })}
                inputMode="numeric"
                placeholder="9876543210"
                aria-invalid={!!errors.mobile}
              />
              {errors.mobile ? (
                <p className="text-destructive text-xs">
                  {errors.mobile.message}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Looking up..." : "Download certificate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
