"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useGetMember } from "@/features/members/api/use-get-member"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"
import { MemberAvatar } from "./member-avatar"
import { MemberRole } from "@/features/members/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDeleteMember } from "@/features/members/api/use-delete-member"
import { useUpdateMember } from "@/features/members/api/use-update-member"
import { useConfirm } from "@/hooks/use-confirm"
import { useUpdatedMember } from "@/features/members/api/use-updated-member"

const MembersList = () => {
    const workspaceId = useWorkspaceId()
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "This member will be removed from the workspace. Are you sure?",
    )
    const { data } = useGetMember({ workspaceId })
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember()
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdatedMember()

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            json: { role },
            param: { memberId },
        })
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm()
        if (!ok) return;

        deleteMember({ param: { memberId } }, {
            onSuccess: () => {
                window.location.reload()
            }
        })
    }


    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <Separator />
            </div>
            <CardContent className="p-7 flex flex-col">
                {data?.map((member, index) => (
                    <Fragment key={member.$id}>
                        <div className="flex items-center gap-2">
                            <MemberAvatar
                                className="size-10"
                                fallbackClassName="text-lg"
                                name={member.name}
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground font-medium">{member.email}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="ml-auto" variant="secondary" size="icon">
                                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" align="end">
                                    <DropdownMenuItem className="font-medium"
                                        onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                        disabled={isUpdatingMember}>
                                        Set as Administrator
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="font-medium"
                                        onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)} disabled={isUpdatingMember}>
                                        Set as Member
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="font-medium text-red-700"
                                        onClick={() => handleDeleteMember(member.$id)} disabled={isDeletingMember}>
                                        Remove {member.name}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index !== data.length - 1 && <Separator className="my-2.5 text-neutral-300" />}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    )
}

export default MembersList
