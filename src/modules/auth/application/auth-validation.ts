import { z } from "zod";

export const loginCommandSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});

export const registerCommandSchema = loginCommandSchema.extend({
  displayName: z.string().trim().min(1).max(80),
  password: z.string().min(12).max(128),
});
