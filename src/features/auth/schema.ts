import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email(),
    password: z.string().min(8, "Required minimum of 8 characters"),
    code: z.number(),
})