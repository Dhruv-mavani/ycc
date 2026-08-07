import { z } from "zod";
import { phoneSchema } from "@/lib/validations/registration";

export const partnerProgramApplicationSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  collegeId: z.string().uuid({ message: "Select your college" }),
  stream: z.string().trim().min(1, "Required").max(150),
  semester: z.string().trim().min(1, "Required").max(50),
  mobile: phoneSchema,
  instagramHandle: z.string().trim().min(1, "Required").max(100),
  referredBy: z.string().trim().max(150).optional(),
  agreementQ1: z.enum(["Yes", "No"], { message: "Please select an option" }),
  agreementQ2: z.enum(["Yes", "No"], { message: "Please select an option" }),
  agreementQ3: z.enum(["Yes, Absolutely", "No"], {
    message: "Please select an option",
  }),
});

export type PartnerProgramApplicationInput = z.infer<
  typeof partnerProgramApplicationSchema
>;
