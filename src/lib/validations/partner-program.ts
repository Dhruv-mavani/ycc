import { z } from "zod";
import { ageSchema, genderSchema, phoneSchema } from "@/lib/validations/registration";

export const partnerTypeSchema = z.enum(["campus", "class", "classmate"]);

const partnerProgramFieldsSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  mobile: phoneSchema,
  age: ageSchema,
  gender: genderSchema,
  instagramHandle: z.string().trim().min(1, "Required").max(100),
  referredBy: z.string().trim().max(150).optional(),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Partner Program terms to continue",
  }),
});

// Used when submitting a new application — no account/login is created, so
// this just captures the referral link that routes Class/Classmate
// approvals to the right partner above them in the hierarchy.
export const partnerProgramApplicationSchema = partnerProgramFieldsSchema
  .extend({
    partnerType: partnerTypeSchema,
    referredById: z.string().uuid().optional(),
    whatsappJoined: z.boolean().refine((v) => v === true, {
      message: "Join the WhatsApp channel to continue",
    }),
    instagramJoined: z.boolean().refine((v) => v === true, {
      message: "Join our Instagram to continue",
    }),
  })
  .refine((data) => data.partnerType !== "campus" || !!data.referredBy?.trim(), {
    message: "Enter who referred you",
    path: ["referredBy"],
  })
  .refine((data) => data.partnerType === "campus" || !!data.referredById, {
    message: "Select who referred you",
    path: ["referredById"],
  });

// Used by the admin edit dialog — doesn't touch the referral link.
export const partnerProgramApplicationUpdateSchema = partnerProgramFieldsSchema;

export const partnerCertificateLookupSchema = z.object({
  mobile: phoneSchema,
});

export type PartnerProgramApplicationInput = z.infer<
  typeof partnerProgramApplicationSchema
>;

export type PartnerProgramApplicationUpdateInput = z.infer<
  typeof partnerProgramApplicationUpdateSchema
>;

export type PartnerCertificateLookupInput = z.infer<
  typeof partnerCertificateLookupSchema
>;
