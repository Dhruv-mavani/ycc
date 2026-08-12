import { z } from "zod";
import { phoneSchema } from "@/lib/validations/registration";

export const partnerTypeSchema = z.enum(["campus", "class", "classmate"]);

const partnerProgramFieldsSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  mobile: phoneSchema,
  instagramHandle: z.string().trim().min(1, "Required").max(100),
  referredBy: z.string().trim().max(150).optional(),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Partner Program terms to continue",
  }),
});

// Used when submitting a new application — captures the password used to
// create the applicant's Supabase Auth account, so they can log in once
// approved, plus the referral link that routes Class/Classmate approvals
// to the right partner above them in the hierarchy.
export const partnerProgramApplicationSchema = partnerProgramFieldsSchema
  .extend({
    partnerType: partnerTypeSchema,
    referredById: z.string().uuid().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.partnerType === "campus" || !!data.referredById, {
    message: "Select who referred you",
    path: ["referredById"],
  });

// Used by the admin edit dialog — doesn't touch the applicant's account or referral link.
export const partnerProgramApplicationUpdateSchema = partnerProgramFieldsSchema;

export const partnerLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const partnerForgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const partnerResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const partnerCertificateLookupSchema = z.object({
  mobile: phoneSchema,
  password: z.string().min(1, "Enter your password"),
});

export type PartnerProgramApplicationInput = z.infer<
  typeof partnerProgramApplicationSchema
>;

export type PartnerProgramApplicationUpdateInput = z.infer<
  typeof partnerProgramApplicationUpdateSchema
>;

export type PartnerLoginInput = z.infer<typeof partnerLoginSchema>;

export type PartnerForgotPasswordInput = z.infer<typeof partnerForgotPasswordSchema>;

export type PartnerResetPasswordInput = z.infer<typeof partnerResetPasswordSchema>;

export type PartnerCertificateLookupInput = z.infer<
  typeof partnerCertificateLookupSchema
>;
