import { z } from "zod";
import { genderSchema, phoneSchema } from "@/lib/validations/registration";

// YCC Club — a lightweight signup, unlike the College Campus Partner
// application: just name, WhatsApp number, gender, and the two join gates.
// No college, no T&C, no certificate.
export const yccClubApplicationSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  mobile: phoneSchema,
  gender: genderSchema,
  whatsappJoined: z.boolean().refine((v) => v === true, {
    message: "Join the YCC WhatsApp channel to continue",
  }),
  instagramJoined: z.boolean().refine((v) => v === true, {
    message: "Join our Instagram to continue",
  }),
});

export type YccClubApplicationInput = z.infer<typeof yccClubApplicationSchema>;
