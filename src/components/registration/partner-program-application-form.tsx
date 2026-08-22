"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageCircle, CheckCircle2, FileX } from "lucide-react";
import { WHATSAPP_CHANNEL_URL, WHATSAPP_CHANNEL_URL_SQUAD } from "@/lib/partner-whatsapp";

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
  DialogDescription,
} from "@/components/ui/dialog";
import { PartnerTournamentTermsContent } from "@/components/registration/partner-tournament-terms-content";
import {
  partnerProgramApplicationSchema,
  type PartnerProgramApplicationInput,
} from "@/lib/validations/partner-program";
import type { PartnerType } from "@/lib/supabase/types";

interface ReferrerOption {
  id: string;
  name: string;
  team_code?: string | null;
  type?: "campus" | "class";
}

interface CollegeOption {
  id: string;
  name: string;
}

export function PartnerProgramApplicationForm({
  partnerType,
  referrerOptions,
  referrerLabel,
  colleges,
}: {
  partnerType: PartnerType;
  referrerOptions: ReferrerOption[];
  referrerLabel: string;
  colleges: CollegeOption[];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

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
      collegeId: "",
      referredBy: "",
      referredById: undefined,
      agreedToTerms: false,
      whatsappJoined: false,
      instagramJoined: false,
    },
  });

  const agreedToTerms = useWatch({ control, name: "agreedToTerms" });
  const whatsappJoined = useWatch({ control, name: "whatsappJoined" });
  const instagramJoined = useWatch({ control, name: "instagramJoined" });
  const whatsappChannelUrl =
    partnerType === "classmate" ? WHATSAPP_CHANNEL_URL_SQUAD : WHATSAPP_CHANNEL_URL;

  // Fetches the certificate first instead of navigating the browser straight
  // to the API route — a raw navigation has no way to show a friendly error
  // if the download fails (e.g. the application was since deleted by an
  // admin), so the visitor would just land on a bare JSON error page.
  async function downloadCertificate(id: string) {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/partner-program/certificate/${id}/download`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setDownloadError(
          errorData.error === "Certificate not found"
            ? "We couldn't find this application anymore — it looks like it was removed. If you think this is a mistake, please get in touch with the YCC team."
            : (errorData.error ?? "Something went wrong while preparing your certificate. Please try again."),
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
      void downloadCertificate(data.applicationId);
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  if (submitted) {
    return (
      <>
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
              disabled={downloading}
              onClick={() => downloadCertificate(applicationId)}
            >
              {downloading ? "Downloading..." : "Download certificate again"}
            </Button>
          </CardContent>
        ) : null}
      </Card>

      <Dialog
        open={downloadError !== null}
        onOpenChange={(open) => {
          if (!open) setDownloadError(null);
        }}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center">
            <div className="rounded-full bg-destructive/10 p-3 mb-2">
              <FileX className="size-6 text-destructive" />
            </div>
            <DialogTitle>Certificate unavailable</DialogTitle>
            <DialogDescription>{downloadError}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 px-6 sm:px-10 pt-8">
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center gap-2 min-[480px]:gap-3">
            <CardTitle className="text-2xl font-bold text-slate-800">Your details</CardTitle>
            <div className="flex items-start gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700">
              <p className="text-xs font-medium leading-snug">
                <span className="font-bold block mb-0.5">Hey There! 👋🏻</span>
                Please make sure everything is correct before you hit &quot;Submit.&quot; Once submitted cannot be edited or resubmitted.
              </p>
            </div>
          </div>
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
          <Field label="College" error={errors.collegeId?.message}>
            <Controller
              control={control}
              name="collegeId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Search for your college..."
                  emptyText="No match found."
                  options={colleges.map((c) => ({ value: c.id, label: c.name }))}
                />
              )}
            />
          </Field>
          {partnerType === "campus" ? (
            <Field
              label="Name of YCC Partner (referred you)"
              error={errors.referredBy?.message}
            >
              <Input {...register("referredBy")} />
            </Field>
          ) : (
            <Field
              label={
                partnerType === "classmate"
                  ? "Enter Your Partner's name/code"
                  : `${referrerLabel}'s name/code`
              }
              error={errors.referredById?.message}
            >
              <Controller
                control={control}
                name="referredById"
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? "")}
                    placeholder={
                      partnerType === "classmate"
                        ? "Search for your Partner..."
                        : `Search for your ${referrerLabel}...`
                    }
                    emptyText="No match found."
                    options={referrerOptions.map((r) => ({
                      value: r.id,
                      label: r.name,
                      sublabel:
                        [
                          r.type === "campus"
                            ? "YCC Partner"
                            : r.type === "class"
                              ? "YCC Co-Partner"
                              : null,
                          r.team_code,
                        ]
                          .filter(Boolean)
                          .join(" · ") || undefined,
                      searchText: r.team_code ?? undefined,
                    }))}
                  />
                )}
              />
              {referrerOptions.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  {partnerType === "classmate"
                    ? "No approved Partners found yet."
                    : `No approved ${referrerLabel}s found yet.`}
                </p>
              ) : null}
            </Field>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join our communities</CardTitle>
          <CardDescription>
            Required before you can submit — follow the YCC Partners Group
            channel and our Instagram for updates, coordination, and
            announcements.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
          <div>
            <Button
              type="button"
              variant={whatsappJoined ? "outline" : "default"}
              className="h-auto w-full min-h-8 py-2 text-center leading-snug whitespace-normal"
              nativeButton={false}
              onClick={() => setValue("whatsappJoined", true, { shouldValidate: true })}
              render={
                <a href={whatsappChannelUrl} target="_blank" rel="noopener noreferrer">
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
            disabled={isSubmitting || !agreedToTerms || !whatsappJoined || !instagramJoined}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Program Terms &amp; Conditions</DialogTitle>
          </DialogHeader>
          <PartnerTournamentTermsContent />
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
