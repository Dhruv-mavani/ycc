"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { WHATSAPP_CHANNEL_URL } from "@/lib/partner-whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  CardFooter,
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
  partnerProgramApplicationSchema,
  type PartnerProgramApplicationInput,
} from "@/lib/validations/partner-program";
import type { PartnerType } from "@/lib/supabase/types";

interface ReferrerOption {
  id: string;
  name: string;
  team_code?: string | null;
}

export function PartnerProgramApplicationForm({
  partnerType,
  referrerOptions,
  referrerLabel,
}: {
  partnerType: PartnerType;
  referrerOptions: ReferrerOption[];
  referrerLabel: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PartnerProgramApplicationInput>({
    resolver: zodResolver(partnerProgramApplicationSchema),
    defaultValues: {
      partnerType,
      name: "",
      email: "",
      mobile: "",
      instagramHandle: "",
      referredBy: "",
      referredById: undefined,
      agreedToTerms: false,
      whatsappJoined: false,
    },
  });

  const agreedToTerms = useWatch({ control, name: "agreedToTerms" });
  const whatsappJoined = useWatch({ control, name: "whatsappJoined" });

  const typeLabel =
    partnerType === "campus"
      ? "YCC Partner"
      : partnerType === "class"
        ? "YCC Co-Partner"
        : "Classmate Partner";
  const scopeText =
    partnerType === "campus"
      ? "on your college campus"
      : partnerType === "class"
        ? "in your class"
        : "among your classmates";

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

      const data: { applicationId: string } = await res.json();
      setApplicationId(data.applicationId);
      setSubmitted(true);

      if (partnerType === "classmate") return;
      const downloadUrl = `/api/partner-program/certificate/${data.applicationId}/download`;
      window.location.assign(downloadUrl);
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  if (submitted) {
    return (
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white text-center py-10">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-slate-800 mb-2">
            {partnerType === "classmate"
              ? "Thanks for applying!"
              : "You're in!"}
          </CardTitle>
          <CardDescription>
            {partnerType === "classmate" ? (
              "We've received your application. Our team will reach out to you soon."
            ) : (
              <>
                Your certificate is downloading now. Missed it? Use the
                button below, or re-download it any time from{" "}
                <Link
                  href="/partner-program/certificate"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  the certificate lookup page
                </Link>{" "}
                with your mobile number.
              </>
            )}
          </CardDescription>
        </CardHeader>
        {partnerType !== "classmate" && applicationId ? (
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={
                <a
                  href={`/api/partner-program/certificate/${applicationId}/download`}
                >
                  Download certificate again
                </a>
              }
            />
          </CardContent>
        ) : null}
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 px-6 sm:px-10 pt-8">
          <CardTitle className="text-2xl font-bold text-slate-800">Your details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-6 sm:px-10 py-8">
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Mobile / WhatsApp number" error={errors.mobile?.message}>
            <Input
              {...register("mobile")}
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
          <Field
            label="Instagram handle"
            error={errors.instagramHandle?.message}
          >
            <Input {...register("instagramHandle")} placeholder="yourhandle" />
          </Field>
          {partnerType === "campus" ? (
            <Field
              label="Name of YCC Partner (referred you) — optional"
              error={errors.referredBy?.message}
            >
              <Input {...register("referredBy")} />
            </Field>
          ) : (
            <Field
              label={`${referrerLabel}'s name/code`}
              error={errors.referredById?.message}
            >
              <Controller
                control={control}
                name="referredById"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? "")}
                    placeholder={`Search for your ${referrerLabel}...`}
                    emptyText="No match found."
                    options={referrerOptions.map((r) => ({
                      value: r.id,
                      label: r.name,
                      sublabel: r.team_code ?? undefined,
                      searchText: r.team_code ?? undefined,
                    }))}
                  />
                )}
              />
              {referrerOptions.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No approved {referrerLabel}s found yet.
                </p>
              ) : null}
            </Field>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join the WhatsApp channel</CardTitle>
          <CardDescription>
            Required before you can submit — follow the YCC Partners Group
            channel for updates, coordination, and announcements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant={whatsappJoined ? "outline" : "default"}
            className="h-auto w-full min-h-8 py-2 text-center leading-snug whitespace-normal"
            nativeButton={false}
            onClick={() => setValue("whatsappJoined", true, { shouldValidate: true })}
            render={
              <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                {whatsappJoined ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <MessageCircle className="size-4 shrink-0" />
                )}
                {whatsappJoined ? "Joined — open channel again" : "Join WhatsApp Channel"}
              </a>
            }
          />
          {errors.whatsappJoined ? (
            <p className="text-destructive text-xs mt-1.5">
              {errors.whatsappJoined.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field }) => (
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="agreedToTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={!!errors.agreedToTerms}
                  className="mt-0.5"
                />
                <div className="space-y-1.5">
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
                  {errors.agreedToTerms ? (
                    <p className="text-destructive text-xs">
                      {errors.agreedToTerms.message}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 sm:px-10 py-6">
          <Button
            type="submit"
            className="w-full sm:w-auto px-8 h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
            disabled={isSubmitting || !agreedToTerms || !whatsappJoined}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Partner Program Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              Selected {typeLabel}s will receive exclusive benefits,
              incentives, and commission &amp; partner program opportunities
              based on their work and performance.
            </li>
            <li>
              By applying, you agree to work with YCC as a {typeLabel} and to
              assist with all the requirements to promote our campaigns and
              events {scopeText}.
            </li>
            <li>
              We believe every YCC {typeLabel} should actively participate in
              YCC events and support our initiatives. Great leaders lead by
              example — we believe every Founder and Partner should support,
              use, and represent our services before encouraging others to
              join.
            </li>
          </ul>
        </DialogContent>
      </Dialog>
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
