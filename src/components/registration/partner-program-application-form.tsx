"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartnerProgramApplicationInput>({
    resolver: zodResolver(partnerProgramApplicationSchema),
    defaultValues: {
      partnerType,
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      instagramHandle: "",
      referredBy: "",
      referredById: undefined,
      agreedToTerms: false,
    },
  });

  const agreedToTerms = useWatch({ control, name: "agreedToTerms" });

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
      <Card>
        <CardHeader>
          <CardTitle>
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
                with your mobile number and password.
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
          <Field label="Password" error={errors.password?.message}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>
          <Field
            label="Re-enter password"
            error={errors.confirmPassword?.message}
          >
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
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
          {partnerType === "campus" ? (
            <Field
              label="Name of YCC Partner (referred you) — optional"
              error={errors.referredBy?.message}
            >
              <Input {...register("referredBy")} />
            </Field>
          ) : partnerType === "class" ? (
            <Field
              label={`${referrerLabel}'s code`}
              error={errors.referredById?.message}
            >
              <Controller
                control={control}
                name="referredById"
                render={({ field }) => (
                  <TeamCodeField
                    value={field.value}
                    options={referrerOptions}
                    notFoundLabel={referrerLabel}
                    onResolve={field.onChange}
                  />
                )}
              />
            </Field>
          ) : (
            <Field
              label="Your YCC Co-Partner's team code"
              error={errors.referredById?.message}
            >
              <Controller
                control={control}
                name="referredById"
                render={({ field }) => (
                  <TeamCodeField
                    value={field.value}
                    options={referrerOptions}
                    notFoundLabel="YCC Co-Partner"
                    onResolve={field.onChange}
                  />
                )}
              />
            </Field>
          )}
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
      </Card>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !agreedToTerms}
      >
        {isSubmitting ? "Submitting..." : "Submit application"}
      </Button>

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

function TeamCodeField({
  value,
  options,
  notFoundLabel = "YCC Co-Partner",
  onResolve,
}: {
  value: string | undefined;
  options: ReferrerOption[];
  notFoundLabel?: string;
  onResolve: (id: string | undefined) => void;
}) {
  const matched = options.find((o) => o.id === value);
  const [text, setText] = useState(matched?.team_code ?? "");
  const [touched, setTouched] = useState(false);

  return (
    <div className="space-y-1.5">
      <Input
        placeholder="e.g. ABHI9864"
        value={text}
        onChange={(e) => {
          const raw = e.target.value.toUpperCase();
          setText(raw);
          setTouched(true);
          const found = options.find((o) => o.team_code === raw.trim());
          onResolve(found?.id);
        }}
      />
      {touched && text.trim() ? (
        matched ? (
          <p className="text-xs text-emerald-600">Referred by {matched.name}</p>
        ) : (
          <p className="text-destructive text-xs">
            No {notFoundLabel} found with that code.
          </p>
        )
      ) : null}
    </div>
  );
}
