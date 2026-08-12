"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  partnerProgramApplicationUpdateSchema,
  type PartnerProgramApplicationUpdateInput,
} from "@/lib/validations/partner-program";
import type { PartnerApplicationStatus, PartnerType } from "@/lib/supabase/types";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  instagram_handle: string;
  referred_by: string | null;
  agreed_to_terms: boolean;
  partner_type: PartnerType;
  status: PartnerApplicationStatus;
  created_at: string;
}

export function EditPartnerProgramDialog({
  application,
  open,
  onOpenChange,
  onSaved,
}: {
  application: PartnerProgramApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: PartnerProgramApplication) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartnerProgramApplicationUpdateInput>({
    resolver: zodResolver(partnerProgramApplicationUpdateSchema),
  });

  useEffect(() => {
    if (!application) return;
    reset({
      name: application.name,
      email: application.email,
      mobile: application.mobile,
      instagramHandle: application.instagram_handle,
      referredBy: application.referred_by ?? "",
      agreedToTerms: application.agreed_to_terms,
    });
  }, [application, reset]);

  async function onSubmit(values: PartnerProgramApplicationUpdateInput) {
    if (!application) return;
    try {
      const res = await fetch(`/api/admin/partner-program/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error ?? "Could not update application");
        return;
      }

      const data = await res.json();
      onSaved(data.application);
      toast.success("Application updated");
      onOpenChange(false);
    } catch {
      toast.error("Network error — please check your connection and try again");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit partner program application</DialogTitle>
          <DialogDescription>Update this applicant&apos;s details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Mobile" error={errors.mobile?.message}>
            <Input {...register("mobile")} inputMode="numeric" />
          </Field>
          <Field label="Instagram handle" error={errors.instagramHandle?.message}>
            <Input {...register("instagramHandle")} />
          </Field>
          <Field label="Referred by (optional)" error={errors.referredBy?.message}>
            <Input {...register("referredBy")} />
          </Field>

          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field }) => (
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="edit-agreedToTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={!!errors.agreedToTerms}
                />
                <Label htmlFor="edit-agreedToTerms" className="font-normal">
                  Agreed to Partner Program T&amp;C
                </Label>
              </div>
            )}
          />
          {errors.agreedToTerms ? (
            <p className="text-destructive text-xs">
              {errors.agreedToTerms.message}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
