"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageCircle, CheckCircle2, Loader2 } from "lucide-react";
import { WHATSAPP_CHANNEL_URL_OFFICIAL } from "@/lib/partner-whatsapp";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  yccClubApplicationSchema,
  type YccClubApplicationInput,
} from "@/lib/validations/ycc-club";

const INSTAGRAM_URL = "https://instagram.com/ycct10";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function YccClubForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<YccClubApplicationInput>({
    resolver: zodResolver(yccClubApplicationSchema),
    defaultValues: {
      name: "",
      mobile: "",
      whatsappJoined: false,
      instagramJoined: false,
    },
  });

  const whatsappJoined = useWatch({ control, name: "whatsappJoined" });
  const instagramJoined = useWatch({ control, name: "instagramJoined" });

  async function onSubmit(values: YccClubApplicationInput) {
    try {
      const res = await fetch("/api/ycc-club", {
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
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white text-center py-10">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-slate-800 mb-2">
            You&apos;re in!
          </CardTitle>
          <CardDescription>
            Welcome to YCC Club — we&apos;ll keep you posted on everything
            YCC through WhatsApp and Instagram.
          </CardDescription>
        </CardHeader>
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
          <Field label="WhatsApp number" error={errors.mobile?.message}>
            <Input
              {...register("mobile")}
              inputMode="numeric"
              placeholder="10-digit mobile"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join our communities</CardTitle>
          <CardDescription>
            Required before you can submit — join the YCC WhatsApp channel
            and follow our Instagram for updates, coordination, and
            announcements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Button
              type="button"
              variant={whatsappJoined ? "outline" : "default"}
              className="h-auto w-full min-h-8 py-2 text-center leading-snug whitespace-normal"
              nativeButton={false}
              onClick={() => setValue("whatsappJoined", true, { shouldValidate: true })}
              render={
                <a href={WHATSAPP_CHANNEL_URL_OFFICIAL} target="_blank" rel="noopener noreferrer">
                  {whatsappJoined ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <MessageCircle className="size-4 shrink-0" />
                  )}
                  {whatsappJoined ? "Joined — open channel again" : "Join YCC Channel"}
                </a>
              }
            />
            {errors.whatsappJoined ? (
              <p className="text-destructive text-xs mt-1.5">
                {errors.whatsappJoined.message}
              </p>
            ) : null}
          </div>
          <div>
            <Button
              type="button"
              variant={instagramJoined ? "outline" : "default"}
              className="h-auto w-full min-h-8 py-2 text-center leading-snug whitespace-normal"
              nativeButton={false}
              onClick={() => setValue("instagramJoined", true, { shouldValidate: true })}
              render={
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  {instagramJoined ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <InstagramIcon className="size-4 shrink-0" />
                  )}
                  {instagramJoined ? "Joined — open Instagram again" : "Join Instagram"}
                </a>
              }
            />
            {errors.instagramJoined ? (
              <p className="text-destructive text-xs mt-1.5">
                {errors.instagramJoined.message}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 sm:px-10 py-6">
          <Button
            type="submit"
            className="w-full sm:w-auto px-8 h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all"
            disabled={isSubmitting || !whatsappJoined || !instagramJoined}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" /> Submitting...
              </>
            ) : (
              "Join YCC Club"
            )}
          </Button>
        </CardFooter>
      </Card>
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
