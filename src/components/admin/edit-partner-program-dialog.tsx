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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  partnerProgramApplicationUpdateSchema,
  type PartnerProgramApplicationUpdateInput,
} from "@/lib/validations/partner-program";
import type { PartnerApplicationStatus, PartnerType } from "@/lib/supabase/types";

interface PartnerProgramApplication {
  id: string;
  name: string;
  email: string;
  college_id: string | null;
  collegeName: string;
  stream: string | null;
  semester: string | null;
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
  colleges,
  open,
  onOpenChange,
  onSaved,
}: {
  application: PartnerProgramApplication | null;
  colleges: { id: string; name: string }[];
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
      collegeId: application.college_id ?? "",
      stream: application.stream ?? "",
      semester: application.semester ?? "",
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
      const collegeName =
        colleges.find((c) => c.id === data.application.college_id)?.name ??
        "Unknown college";
      onSaved({ ...data.application, collegeName });
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
          <Field label="College" error={errors.collegeId?.message}>
            <Controller
              control={control}
              name="collegeId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select college">
                      {(value: string | null) =>
                        colleges.find((c) => c.id === value)?.name ?? "Select college"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stream" error={errors.stream?.message}>
              <Input {...register("stream")} />
            </Field>
            <Field label="Semester" error={errors.semester?.message}>
              <Input {...register("semester")} />
            </Field>
          </div>
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
