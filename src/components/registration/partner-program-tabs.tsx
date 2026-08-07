"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationForm } from "@/components/registration/partner-program-application-form";
import { PartnerLoginForm } from "@/components/registration/partner-login-form";

interface ReferrerOption {
  id: string;
  name: string;
  college_id: string;
  stream: string;
  semester: string;
}

const PARTNER_TYPES = [
  {
    id: "campus",
    label: "Campus Partner",
    heading: "Campus Partner Program",
    description:
      "Apply to become a YCC Campus Partner and help us bring events to your college. Fill in your details below.",
  },
  {
    id: "class",
    label: "Class Partner",
    heading: "Class Partner Program",
    description:
      "Apply to become a YCC Class Partner and help us bring events to your class. Fill in your details below.",
  },
  {
    id: "classmate",
    label: "Classmate Partner",
    heading: "Classmate Partner Program",
    description:
      "Apply to become a YCC Classmate Partner and help us bring events to your classmates. Fill in your details below.",
  },
] as const;

export function PartnerProgramTabs({
  colleges,
  campusPartners,
  classPartners,
}: {
  colleges: { id: string; name: string }[];
  campusPartners: ReferrerOption[];
  classPartners: ReferrerOption[];
}) {
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>("campus");
  const [mode, setMode] = useState<"apply" | "login">("apply");
  const active = PARTNER_TYPES.find((t) => t.id === activeId)!;

  const referrerOptions =
    activeId === "class"
      ? campusPartners
      : activeId === "classmate"
        ? classPartners
        : [];
  const referrerLabel = activeId === "class" ? "Campus Partner" : "Class Partner";

  if (mode === "login") {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          New applicant?{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            onClick={() => setMode("apply")}
          >
            Apply here
          </button>
        </p>
        <h1 className="mb-1 text-xl font-bold">Partner login</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Sign in with the email and password you used when you applied.
        </p>
        <PartnerLoginForm />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          className="text-primary underline underline-offset-2"
          onClick={() => setMode("login")}
        >
          Login here
        </button>
      </p>

      <div className="mb-6 inline-flex rounded-lg border border-border/50 bg-muted p-1">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.id}
            type="button"
            size="sm"
            variant={type.id === activeId ? "default" : "ghost"}
            onClick={() => setActiveId(type.id)}
            aria-pressed={type.id === activeId}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <h1 className="mb-1 text-xl font-bold">{active.heading}</h1>
      <p className="text-muted-foreground mb-6 text-sm">{active.description}</p>

      <PartnerProgramApplicationForm
        key={activeId}
        partnerType={activeId}
        colleges={colleges}
        referrerOptions={referrerOptions}
        referrerLabel={referrerLabel}
      />
    </div>
  );
}
