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
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  collegeCampusPartnerApplicationUpdateSchema,
  type CollegeCampusPartnerApplicationUpdateInput,
} from "@/lib/validations/college-campus-partner";

const YEAR_LABELS: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
};

interface CollegeCampusPartnerApplication {
  id: string;
  name: string;
  email: string;
  mobile: string;
  age: number;
  gender: string;
  instagram_handle: string;
  stream: string;
  year: number;
  semester: number;
  code: string | null;
  agreed_to_terms: boolean;
  college_id: string;
  collegeName: string | null;
  created_at: string;
}

interface CollegeOption {
  id: string;
  name: string;
  initials: string;
}

export function EditCollegeCampusPartnerDialog({
  application,
  colleges,
  open,
  onOpenChange,
  onSaved,
}: {
  application: CollegeCampusPartnerApplication | null;
  colleges: CollegeOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: CollegeCampusPartnerApplication) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollegeCampusPartnerApplicationUpdateInput>({
    resolver: zodResolver(collegeCampusPartnerApplicationUpdateSchema),
  });

  useEffect(() => {
    if (!application) return;
    reset({
      name: application.name,
      email: application.email,
      mobile: application.mobile,
      age: application.age,
      gender: application.gender as CollegeCampusPartnerApplicationUpdateInput["gender"],
      instagramHandle: application.instagram_handle,
      collegeId: application.college_id,
      stream: application.stream,
      year: application.year,
      semester: application.semester,
      agreedToTerms: application.agreed_to_terms,
    });
  }, [application, reset]);

  async function onSubmit(values: CollegeCampusPartnerApplicationUpdateInput) {
    if (!application) return;
    try {
      const res = await fetch(`/api/admin/college-campus-partner/${application.id}`, {
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
      onSaved({
        ...data.application,
        collegeName: colleges.find((c) => c.id === data.application.college_id)?.name ?? null,
      });
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
          <DialogTitle>Edit College Campus Partner application</DialogTitle>
          <DialogDescription>Update this applicant&apos;s details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="College" error={errors.collegeId?.message}>
            <Controller
              control={control}
              name="collegeId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value ?? null}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Search for college..."
                  emptyText="No match found."
                  options={colleges.map((c) => ({ value: c.id, label: `${c.initials}\u00A0\u00A0•\u00A0\u00A0${c.name}` }))}
                />
              )}
            />
          </Field>
          <Field label="Stream" error={errors.stream?.message}>
            <Input {...register("stream")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Year" error={errors.year?.message}>
              <Controller
                control={control}
                name="year"
                render={({ field }) => (
                  <Select
                    value={field.value != null ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select">
                        {(value: string | null) =>
                          value ? YEAR_LABELS[value] : "Select"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Semester" error={errors.semester?.message}>
              <Controller
                control={control}
                name="semester"
                render={({ field }) => (
                  <Select
                    value={field.value != null ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select">
                        {(value: string | null) =>
                          value ? `Semester ${value}` : "Select"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          Semester {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field label="Mobile" error={errors.mobile?.message}>
            <Input {...register("mobile")} inputMode="numeric" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Instagram handle" error={errors.instagramHandle?.message}>
            <Input {...register("instagramHandle")} />
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

          <Controller
            control={control}
            name="agreedToTerms"
            render={({ field }) => (
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="edit-college-campus-partner-agreedToTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={!!errors.agreedToTerms}
                />
                <Label htmlFor="edit-college-campus-partner-agreedToTerms" className="font-normal">
                  Agreed to T&amp;C
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
