"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { updateWorkspaceSchema } from "../schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react"
import { Workspace } from "../types"
import { useRouter } from "next/navigation"
import { useUpdateWorkspace } from "../api/use-update-workspace"
import { cn } from "@/lib/utils"
import { useConfirm } from "@/hooks/use-confirm"
import { useDeleteWorkspace } from "../api/use-delete-workspace"
import { toast } from "sonner"
import { useResetInviteCode } from "../api/use-reset-invite-code"

interface EditeWorkspaceFormProps {
    onCancel?: () => void
    initialValue: Workspace
}

export const EditWorkspaceForm = ({ onCancel, initialValue }: EditeWorkspaceFormProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { mutate, isPending } = useUpdateWorkspace()
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace()
    const { mutate: resetInviteCode, isPending: isResetingInviteCode } = useResetInviteCode()

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "Are you sure you want to delete this workspace?",
    )

    const [ResetDialog, confirmReset] = useConfirm(
        "Reset invite Link",
        "This will invalidate the current invite link."
    )

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValue,
            image: initialValue.imageUrl ?? "",
        },
    })

    const handleDelete = async () => {
        const ok = await confirmDelete()
        if (!ok) return

        deleteWorkspace({
            param: { workspaceId: initialValue.$id },
        }, {
            onSuccess: () => {
                window.location.href = "/"
            }
        })
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmReset()
        if (!ok) return

        resetInviteCode({
            param: { workspaceId: initialValue.$id },
        }, {
            onSuccess: () => {
                router.refresh()
            }
        })
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }

        mutate({ form: finalValues, param: { workspaceId: initialValue.$id } }, {
            onSuccess: () => {
                form.reset()
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            form.setValue("image", file)
        }
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValue.$id}/join/${initialValue.inviteCode}`
    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => {
                toast.success("Invite link copied to clipboard")
            })
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button size='sm' variant='secondary' onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValue.$id}`)}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-lg font-bold">
                        {initialValue.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <Separator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter workspace name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}>
                                </FormField>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            alt='Workspace Logo'
                                                            fill
                                                            className="object-cover"
                                                            src={
                                                                field.value instanceof File
                                                                    ? URL.createObjectURL(field.value)
                                                                    : field.value
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-9 text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Workspace Icon</p>
                                                    <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG Max 2MB</p>
                                                    <input
                                                        className="hidden"
                                                        type='file'
                                                        accept=".jpg, .jpeg, .png, .svg"
                                                        ref={inputRef}
                                                        onChange={handleImageChange}
                                                        disabled={isPending}
                                                    />
                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="destructive"
                                                            size="sm"
                                                            className="mt-2 w-fit"
                                                            onClick={() => {
                                                                field.onChange(null)
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = ''
                                                                }
                                                            }}
                                                        >
                                                            Remove Image
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="secondary"
                                                            size="sm"
                                                            className="mt-2 w-fit"
                                                            onClick={() => inputRef.current?.click()}
                                                        >
                                                            Upload Image
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                                <Separator className="my-7" />
                                <div className="flex items-center justify-between">
                                    <Button className={cn(!onCancel && "invisible")} disabled={isPending} type="button" size="lg" variant="secondary" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                    <Button disabled={isPending} type="submit" size="lg" onClick={onCancel}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Invite Member</h3>
                        <p className="text-sm text-muted-foreground">
                            Use the invite link to add members to your workspace.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled className="h-12" value={fullInviteLink} />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant="secondary"
                                    className="size-12"
                                >
                                    <CopyIcon />
                                </Button>
                            </div>
                        </div>
                        <Separator className="my-7" />
                        <Button className="mt-6 w-fit ml-auto" size='sm' variant='destructive' type="button"
                            disabled={isPending || isResetingInviteCode} onClick={handleResetInviteCode}>
                            Reset Invite Link
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleteing a workspace is irreversible and will remove all associated data.
                        </p>
                        <Button className="mt-6 w-fit ml-auto" size='sm' variant='destructive' type="button"
                            disabled={isPending || isDeletingWorkspace} onClick={handleDelete}>
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}