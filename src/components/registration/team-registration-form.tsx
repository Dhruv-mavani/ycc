"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  teamRegistrationSchema,
  type TeamRegistrationInput,
} from "@/lib/validations/registration";
import { RazorpayCheckoutButton } from "@/components/registration/razorpay-checkout-button";
import { GstBreakdown } from "@/components/registration/gst-breakdown";

interface ReferrerOption {
  id: string;
  name: string;
  team_code: string | null;
}

interface RosterMember {
  id: string;
  name: string;
  phone: string;
  alreadyAllotted: boolean;
}

type ReferrerType = "campus" | "class";

export function TeamRegistrationForm({
  eventId,
  eventName,
  maxTeamSize,
  feePaise,
  campusPartners,
  classPartners,
}: {
  eventId: string;
  eventName: string;
  maxTeamSize: number;
  feePaise: number;
  campusPartners: ReferrerOption[];
  classPartners: ReferrerOption[];
}) {
  const [submitted, setSubmitted] = useState<{
    registrationId: string;
    amountPaise: number;
    captainName: string;
    captainPhone: string;
  } | null>(null);
  const [referrerType, setReferrerType] = useState<ReferrerType | "">("");
  const [referrerId, setReferrerId] = useState("");
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [squadError, setSquadError] = useState<string | null>(null);
  const [captain, setCaptain] = useState<{ name: string; phone: string } | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamRegistrationInput>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      type: "team",
      eventId,
      collegeId: "",
      teamName: "",
      players: [],
    },
  });

  const seatsAvailable = maxTeamSize - 1; // one seat is always the captain

  const referrerLabel =
    referrerType === "campus"
      ? "YCC Partner"
      : referrerType === "class"
        ? "YCC Co-Partner"
        : "";
  const childLabel =
    referrerType === "campus"
      ? "Co-Partners"
      : referrerType === "class"
        ? "Classmate Partners"
        : "";
  const referrerOptions =
    referrerType === "campus"
      ? campusPartners
      : referrerType === "class"
        ? classPartners
        : [];

  function resetSquad() {
    setCaptain(null);
    setRoster([]);
    setSelectedIds(new Set());
    setQuery("");
    setValue("collegeId", "");
    setValue("players", []);
    setSquadError(null);
  }

  function syncPlayers(nextSelected: Set<string>) {
    const selectedMembers = roster.filter((r) => nextSelected.has(r.id));
    setValue(
      "players",
      captain
        ? [captain, ...selectedMembers.map((r) => ({ name: r.name, phone: r.phone }))]
        : [],
      { shouldValidate: true },
    );
  }

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= seatsAvailable) return prev;
        next.add(id);
      }
      syncPlayers(next);
      return next;
    });
  }

  async function loadSquad(type: ReferrerType, id: string) {
    setLoadingSquad(true);
    setSquadError(null);
    try {
      const res = await fetch(
        `/api/partner-program/squad-source?type=${type}&id=${id}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSquadError(data.error ?? "Could not load this squad");
        resetSquad();
        return;
      }
      setValue("collegeId", data.collegeId, { shouldValidate: true });
      setValue("teamName", `${data.captain.name} — Squad`);
      setCaptain(data.captain);
      setRoster(data.roster ?? []);
      setSelectedIds(new Set());
      setValue("players", []);
      setQuery("");
    } catch {
      setSquadError("Network error — please try again");
    } finally {
      setLoadingSquad(false);
    }
  }

  async function onSubmit(values: TeamRegistrationInput) {
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
        captainName: values.players[0].name,
        captainPhone: values.players[0].phone,
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
            prefillName={submitted.captainName}
            prefillEmail={null}
            prefillPhone={submitted.captainPhone}
          />
        </CardContent>
      </Card>
    );
  }

  const availableCount = roster.filter((r) => !r.alreadyAllotted).length;
  const filteredRoster = roster.filter((r) =>
    r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const squadReady = selectedIds.size === seatsAvailable;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team details</CardTitle>
          <CardDescription>
            Entry fee: ₹{(feePaise / 100).toLocaleString("en-IN")} per team +
            18% GST
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Are you a YCC Partner or YCC Co-Partner?">
            <Select
              value={referrerType}
              onValueChange={(val) => {
                setReferrerType(val as ReferrerType);
                setReferrerId("");
                resetSquad();
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select one">
                  {(value: string | null) =>
                    value === "campus"
                      ? "YCC Partner"
                      : value === "class"
                        ? "YCC Co-Partner"
                        : "Select one"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus">YCC Partner</SelectItem>
                <SelectItem value="class">YCC Co-Partner</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {referrerType ? (
            <Field
              label={`${referrerLabel}'s name/code`}
              error={errors.collegeId?.message}
            >
              <Select
                value={referrerId}
                onValueChange={(val) => {
                  if (!val) return;
                  setReferrerId(val);
                  loadSquad(referrerType, val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Select your ${referrerLabel}`}>
                    {(value: string | null) => {
                      const match = referrerOptions.find((o) => o.id === value);
                      if (!match) return `Select your ${referrerLabel}`;
                      return match.team_code
                        ? `${match.name} (${match.team_code})`
                        : match.name;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {referrerOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                      {r.team_code ? (
                        <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                          {r.team_code}
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {referrerOptions.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No approved {referrerLabel}s found yet.
                </p>
              ) : null}
              {squadError ? (
                <p className="text-destructive text-xs">{squadError}</p>
              ) : null}
            </Field>
          ) : null}

          <Field label="Team name" error={errors.teamName?.message}>
            <Input {...register("teamName")} placeholder="e.g. CK Strikers" />
          </Field>
        </CardContent>
      </Card>

      {captain ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Squad ({selectedIds.size + 1}/{maxTeamSize})
            </CardTitle>
            <CardDescription>
              {loadingSquad
                ? "Loading roster…"
                : squadReady
                  ? "Ready to register — pick a different set of people to build another team."
                  : `Pick ${seatsAvailable - selectedIds.size} more ${childLabel} to complete this team. ${availableCount} available.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{captain.name}</p>
                <p className="text-muted-foreground text-xs">{captain.phone}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">Captain</Badge>
            </div>

            {roster.length > 0 ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder={`Search ${childLabel.toLowerCase()}...`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            ) : null}

            <div className="max-h-80 space-y-1 overflow-y-auto">
              {filteredRoster.map((member) => {
                const checked = selectedIds.has(member.id);
                const disabled =
                  member.alreadyAllotted ||
                  (!checked && selectedIds.size >= seatsAvailable);
                return (
                  <label
                    key={member.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                      disabled && !checked
                        ? "opacity-50"
                        : "cursor-pointer hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-muted-foreground text-xs">{member.phone}</p>
                      </div>
                    </div>
                    {member.alreadyAllotted ? (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Already in a team
                      </Badge>
                    ) : null}
                  </label>
                );
              })}
              {!loadingSquad && roster.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No approved {childLabel} yet.
                </p>
              ) : null}
              {!loadingSquad && roster.length > 0 && filteredRoster.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No one matches &quot;{query}&quot;.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || loadingSquad || !squadReady}
      >
        {isSubmitting
          ? "Submitting..."
          : squadReady
            ? "Continue to payment"
            : captain
              ? `Select ${seatsAvailable} ${childLabel.toLowerCase()} to continue`
              : "Select a referrer to continue"}
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
