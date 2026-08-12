"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerProgramApplicationForm } from "@/components/registration/partner-program-application-form";
import { PartnerLoginForm } from "@/components/registration/partner-login-form";
import { PartnerForgotPasswordForm } from "@/components/registration/partner-forgot-password-form";

interface ReferrerOption {
  id: string;
  name: string;
  college_id: string | null;
  stream: string | null;
  semester: string | null;
}

const PARTNER_TYPES = [
  {
    id: "campus",
    slug: "YCC-partner",
    label: "YCC Partner",
    heading: "YCC Partner Program",
    description:
      "Apply to become a YCC Partner and help us bring events to your college. Fill in your details below.",
  },
  {
    id: "class",
    slug: "YCC-Co-partner",
    label: "YCC Co-Partner",
    heading: "YCC Co-Partner Program",
    description:
      "Apply to become a YCC Co-Partner and help us bring events to your class. Fill in your details below.",
  },
  {
    id: "classmate",
    slug: "Classmate-partner",
    label: "Classmate Partner",
    heading: "Classmate Partner Program",
    description:
      "Apply to become a YCC Classmate Partner and help us bring events to your classmates. Fill in your details below.",
  },
] as const;

export function PartnerProgramTabs({
  initialType,
  colleges,
  campusPartners,
  classPartners,
}: {
  initialType: (typeof PARTNER_TYPES)[number]["id"];
  colleges: { id: string; name: string }[];
  campusPartners: ReferrerOption[];
  classPartners: ReferrerOption[];
}) {
  const router = useRouter();
  const [activeId, setActiveId] =
    useState<(typeof PARTNER_TYPES)[number]["id"]>(initialType);
  const [mode, setMode] = useState<"apply" | "login" | "forgot">("apply");
  const active = PARTNER_TYPES.find((t) => t.id === activeId)!;

  const referrerOptions =
    activeId === "class"
      ? campusPartners
      : activeId === "classmate"
        ? classPartners
        : [];
  const referrerLabel = activeId === "class" ? "YCC Partner" : "YCC Co-Partner";

  if (mode === "forgot") {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            onClick={() => setMode("login")}
          >
            Back to login
          </button>
        </p>
        <h1 className="mb-1 text-xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>
        <PartnerForgotPasswordForm />
      </div>
    );
  }

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
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <button
            type="button"
            className="text-primary underline underline-offset-2"
            onClick={() => setMode("forgot")}
          >
            Forgot password?
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-border/50 bg-muted p-1">
        {PARTNER_TYPES.map((type) => (
          <Button
            key={type.id}
            type="button"
            size="sm"
            variant={type.id === activeId ? "default" : "ghost"}
            onClick={() => {
              setActiveId(type.id);
              router.push(`/partner-program/${type.slug}`);
            }}
            aria-pressed={type.id === activeId}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          className="text-primary underline underline-offset-2"
          onClick={() => setMode("login")}
        >
          Login here
        </button>
      </p>

      {activeId !== "classmate" ? (
        <Button
          variant="outline"
          size="sm"
          className="mb-6 w-full sm:w-auto"
          nativeButton={false}
          render={
            <Link href="/partner-program/certificate">
              <Download className="size-4" />
              Download your certificate
            </Link>
          }
        />
      ) : null}

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
