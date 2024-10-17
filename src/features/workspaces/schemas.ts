import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.any().optional(),
});

export const updateWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "Must be at least 1 character long"),
    image: z.any().optional(),
});