import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";

const app = new Hono()
    .post(
        "/",
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,
        async (c) => {
            const database = c.get("databases")
            const user = c.get("user")
            const storage = c.get("storage")

            const { name, image } = c.req.valid("form")

            let uploadedImageUrl: string | undefined

            if (image) {
                const MAX_SIZE_MB = 2;
                const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
                if (image.size > MAX_SIZE_BYTES) {
                    return c.json({ error: "Image size exceeds 2MB" }, 400);
                }
                try {
                    const file = await storage.createFile(
                        IMAGES_BUCKET_ID,
                        ID.unique(),
                        image
                    );

                    const arrayBuffer = await storage.getFilePreview(
                        IMAGES_BUCKET_ID,
                        file.$id,
                    );

                    uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
                } catch (error) {
                    console.error("Error uploading image:", error);
                    return c.json({ error: "Image upload failed" }, 500);
                }
            }

            const workspace = await database.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                }
            )

            return c.json({ data: workspace })
        }
    )

export default app