"use client"

import { Loader, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useLogout } from "../api/use-logout"
import { useCurrent } from "../api/use-current"
import { Separator } from "@radix-ui/react-dropdown-menu"

export const UserButton = () => {
    const { data: user, isLoading } = useCurrent()
    const { mutate: logout } = useLogout()

    if (isLoading) {
        return (
            <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                <Loader className="size-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    const { name, email } = user
    const avatarFallback = name
        ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase() ?? "U"
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
                    <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end" side="bottom" sideOffset={10}>
                <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
                    <Avatar className="size-[52px]  border border-neutral-300">
                        <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm capitalize font-medium text-center text-neutral-900">
                            {name || "user"}
                        </p>
                        <p className="text-xs text-neutral-500">{email || "email"}</p>
                    </div>
                </div>
                <Separator className="mb-1" />
                <DropdownMenuItem
                    onClick={() => logout()}
                    className="h-10 flex items-center justify-center cursor-pointer text-red-700 font-medium">
                    <LogOut className="mr-2 size-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}