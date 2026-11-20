import { z } from "zod";
import {
  isValidAdminUsername,
  normalizeAdminUsername,
} from "@/lib/auth/admin-username";

export const adminLoginSchema = z.object({
  username: z
    .string()
    .transform(normalizeAdminUsername)
    .refine(isValidAdminUsername, "Username atau password tidak sesuai."),
  password: z.string().min(1).max(1024),
});

export type AdminLoginInput = z.input<typeof adminLoginSchema>;
