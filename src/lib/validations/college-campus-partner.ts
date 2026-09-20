import { z } from "zod";
import { ageSchema, genderSchema, phoneSchema, emailSchema } from "@/lib/validations/registration";

export const collegeCampusPartnerApplicationSchema = z.object({
  collegeId: z.string().uuid("Select your college"),
  stream: z.string().trim().min(1, "Required").max(100),
  year: z
    .number({ message: "Select your year" })
    .int()
    .min(1, "Select your year")
    .max(4, "Select your year"),
  semester: z
    .number({ message: "Select your semester" })
    .int()
    .min(1, "Select your semester")
    .max(8, "Select your semester"),
  name: z.string().trim().min(2, "Name is too short").max(100),
  mobile: phoneSchema,
  email: emailSchema,
  instagramHandle: z.string().trim().min(1, "Required").max(100),
  age: ageSchema,
  gender: genderSchema,
  whatsappJoined: z.boolean().refine((v) => v === true, {
    message: "Join the WhatsApp channel to continue",
  }),
  instagramJoined: z.boolean().refine((v) => v === true, {
    message: "Join our Instagram to continue",
  }),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: "You must agree to the Terms & Conditions to continue",
  }),
});

// Accepts either the mobile number registered with or the personalized
// code printed on the certificate — the API route tries both, same
// pattern as schoolCertificateLookupSchema/individualFreeCertificateLookupSchema.
export const collegeCampusPartnerCertificateLookupSchema = z.object({
  query: z.string().trim().min(1, "Enter your mobile number or code"),
});

export type CollegeCampusPartnerApplicationInput = z.infer<
  typeof collegeCampusPartnerApplicationSchema
>;

export type CollegeCampusPartnerCertificateLookupInput = z.infer<
  typeof collegeCampusPartnerCertificateLookupSchema
>;
