import { cn } from "@/lib/utils";
import { icons, SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";

const routes = [
    {
        label: "Home",
        href: "/",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon
    }
]

export const Navigation = () => {
    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const isActive = false
                const Icon = isActive ? item.activeIcon : item.icon

                return (
                    <Link href={item.href} key={item.href}>
                        <div className={cn("flex items-center gap-2.5 p-2.5 hover:text-primary transition rounded-md font-medium text-neutral-500", isActive && "bg-white shadow-sm hover:opacity-100 text-primary")}>
                            <Icon className="size-5 text-neutral-500" />
                            {item.label}
                        </div>
                    </Link>
                )
            })}
        </ul>
    )
}