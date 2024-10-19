"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { createProjectSchema } from "../shema"
import { useCreateProject } from "../api/use-create-projects"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"

interface CreateProjectFormProps {
    onCancel?: () => void
}

export const CreateProjectForm = ({ onCancel }: CreateProjectFormProps) => {
    const workspaceId = useWorkspaceId()
    const inputRef = useRef<HTMLInputElement>(null)
    const { mutate, isPending } = useCreateProject()
    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema.omit({ workspaceId: true })),
        defaultValues: {
            name: "",
        },
    })

    const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
            workspaceId
        }


        mutate({ form: finalValues }, {
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

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new project
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
                                            Project Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter project name"
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
                                                <p className="text-sm">Project Icon</p>
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
                                    Create Project
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}