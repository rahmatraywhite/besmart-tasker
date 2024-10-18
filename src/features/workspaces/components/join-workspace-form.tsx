"use client"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useInviteCode } from "../hooks/use-invite-code"
import { useWorkspaceId } from "../hooks/use-workspace-id"
import { useJoinWorkspace } from "../api/use-join-workspace"

interface JoinWorkspaceFormProps {
    intialValues: {
        name: string
    }
}
export const JoinWorkspaceForm = ({
    intialValues,
}: JoinWorkspaceFormProps) => {
    const router = useRouter()
    const workspaceId = useWorkspaceId()
    const inviteCode = useInviteCode()

    const { mutate, isPending } = useJoinWorkspace()

    const onSubmit = () => {
        mutate({
            param: { workspaceId },
            json: { code: inviteCode },
        }, {
            onSuccess: ({ data }) => {
                router.push(`/workspaces/${data.$id}`);
            }
        });
    };



    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join <strong>{intialValues.name}</strong> workspace
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <Separator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col gap-2 lg:flex-row items-center justify-between">
                    <Button
                        className="w-full lg:w-fit"
                        variant="secondary"
                        type="button"
                        size="lg"
                        asChild
                        disabled={isPending}>
                        <Link href="/">
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        className="w-full lg:w-fit"
                        type="button"
                        size="lg"
                        onClick={onSubmit}
                        disabled={isPending || !inviteCode}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}