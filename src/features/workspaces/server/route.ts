import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { z } from "zod";
import { Workspace } from "../types";

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const databases = c.get("databases")

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)],
        )

        if (members.total === 0) {
            return c.json({ data: { document: [], total: 0 } })
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId)

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds),
            ]
        )

        return c.json({ data: workspaces })
    })
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
                    inviteCode: generateInviteCode(6)
                }
            )

            await database.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN,
                }
            )

            return c.json({ data: workspace })
        }
    )
    .patch("/:workspaceId", sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")

            const { workspaceId } = c.req.param()
            const { name, image } = c.req.valid("form")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

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
                    return c.json({ error: "Image upload failed" }, 500);
                }
            } else if (image === null) {
                uploadedImageUrl = image
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            )

            return c.json({ data: workspace })
        })
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { workspaceId } = c.req.param()
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            // TODO : Delete members, project and tasks

            await databases.deleteDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            return c.json({ data: { $id: workspaceId } })
        }
    )
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases")
            const user = c.get("user")
            const { workspaceId } = c.req.param()
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6)
                }
            );

            return c.json({ data: workspace })
        }
    )
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ code: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param()
            const { code } = c.req.valid("json")
            const database = c.get("databases")
            const user = c.get("user")
            const member = await getMember({
                databases: database,
                workspaceId,
                userId: user.$id
            })

            if (member) {
                return c.json({ error: "Already joined" }, 400)
            }

            const workspace = await database.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            )

            if (workspace.inviteCode !== code) {
                return c.json({ error: "Invalid invite code" }, 400)
            }

            await database.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            );

            return c.json({ data: workspace })
        }
    )
export default app