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

export const playerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  phone: phoneSchema,
});

export const teamRegistrationSchema = z.object({
  type: z.literal("team"),
  eventId: z.string().uuid(),
  collegeId: z.string().uuid({ message: "Select your college" }),
  teamName: z.string().trim().min(2, "Team name is too short").max(100),
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

export type PlayerInput = z.infer<typeof playerSchema>;
export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>;
export type IndividualRegistrationInput = z.infer<
  typeof individualRegistrationSchema
>;
export type RegistrationRequestInput = z.infer<
  typeof registrationRequestSchema
>;
