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
  schoolCertificateLookupSchema,
  type SchoolCertificateLookupInput,
} from "@/lib/validations/registration";

export default function SchoolCertificateLookupPage() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolCertificateLookupInput>({
    resolver: zodResolver(schoolCertificateLookupSchema),
    defaultValues: { whatsapp: "" },
  });

  async function onSubmit(values: SchoolCertificateLookupInput) {
    setFormError(null);
    try {
      const res = await fetch("/api/school-registrations/certificate/lookup", {
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
        `/api/school-registrations/${data.registrationId}/certificate`,
      );
    } catch {
      const message = "Network error — please check your connection and try again";
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <div className="relative min-h-screen pb-20 flex flex-col pt-10">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>

      <div className="relative mx-auto w-full max-w-md px-4 flex-1 flex flex-col justify-center z-10">
        <BackButton className="mb-6 self-start" />
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 px-6 sm:px-10 pt-8">
            <CardTitle className="text-2xl font-bold text-slate-800">Re-download your certificate</CardTitle>
            <CardDescription className="text-base mt-2 text-slate-600">
              For YCC Super Champs registrants. Enter the WhatsApp number you
              registered with.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-10 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <Label>WhatsApp number</Label>
              <Input
                {...register("whatsapp", {
                  onChange: () => setFormError(null),
                })}
                inputMode="numeric"
                placeholder="9876543210"
                aria-invalid={!!errors.whatsapp}
              />
              {errors.whatsapp ? (
                <p className="text-destructive text-xs">
                  {errors.whatsapp.message}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}
            <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all" disabled={isSubmitting}>
              {isSubmitting ? "Looking up..." : "Download certificate"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}
