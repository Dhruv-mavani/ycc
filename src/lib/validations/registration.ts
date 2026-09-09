import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const ageSchema = z
  .number({ message: "Enter a valid age" })
  .int("Enter a valid age")
  .min(1, "Enter a valid age")
  .max(119, "Enter a valid age");

export const genderSchema = z.enum(["male", "female", "other"], {
  message: "Select a gender",
});

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(200);

export const playerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  // Optional so a self-registering captain can add teammates by name only —
  // the partner-driven squad flow still always supplies a real phone for
  // every member pulled from their approved roster.
  phone: phoneSchema.optional(),
});

export const teamRegistrationSchema = z.object({
  type: z.literal("team"),
  eventId: z.string().uuid(),
  collegeId: z.string().uuid({ message: "Select your college" }),
  teamName: z.string().trim().min(2, "Team name is too short").max(100),
  captainEmail: emailSchema.optional(),
  players: z
    .array(playerSchema)
    .min(1, "Add at least one player")
    .max(30, "Too many players"),
});

export const individualRegistrationSchema = z.object({
  type: z.literal("individual"),
  eventId: z.string().uuid(),
  collegeId: z.string().uuid({ message: "Select your college" }),
  name: z.string().trim().min(2, "Name is too short").max(100),
  phone: phoneSchema,
  age: ageSchema,
  gender: genderSchema,
  referredByPartnerId: z
    .string()
    .min(1, "Select who referred you")
    .uuid("Select who referred you"),
});

export const registrationRequestSchema = z.discriminatedUnion("type", [
  teamRegistrationSchema,
  individualRegistrationSchema,
]);

// Free, no-payment individual registration for school-targeted events (e.g.
// YCC Super Champs) — deliberately not part of registrationRequestSchema
// above, since it posts to its own endpoint with no payment step at all.
export const schoolRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: emailSchema.optional().or(z.literal("")),
  whatsapp: phoneSchema,
  instagramHandle: z.string().trim().max(50).optional().or(z.literal("")),
  age: ageSchema,
  gender: genderSchema,
  schoolId: z.string().uuid().optional().or(z.literal("")),
});

// Accepts either the WhatsApp number registered with or the personalized
// code printed on the certificate (e.g. "MEGH9999") — the API route tries
// both, same pattern as the general receipt lookup (unique ID or mobile).
export const schoolCertificateLookupSchema = z.object({
  query: z.string().trim().min(1, "Enter your WhatsApp number or code"),
});

export type PlayerInput = z.infer<typeof playerSchema>;
export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>;
export type IndividualRegistrationInput = z.infer<
  typeof individualRegistrationSchema
>;
export type RegistrationRequestInput = z.infer<
  typeof registrationRequestSchema
>;
export type SchoolRegistrationInput = z.infer<typeof schoolRegistrationSchema>;
export type SchoolCertificateLookupInput = z.infer<
  typeof schoolCertificateLookupSchema
>;
