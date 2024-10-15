import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Required"),
})

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().min(1, "Email is required").email(),
    password: z.string().min(8, "Required minimum of 8 characters"),
})