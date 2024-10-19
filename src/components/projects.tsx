"use client"

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri"

const Projects = () => {
    const projectId = null
    const pathname = usePathname();
    const { open } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    const { data } = useGetProjects({
        workspaceId
    });
    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm uppercase text-neutral-500 font-semibold cursor-pointer hover:opacity-75 transition">Projects</p>
                <RiAddCircleFill onClick={open} className="size-5 text-neutral-400 cursor-pointer hover:opacity-75 transition" />
            </div>
            {data?.documents.map((project) => {
                const href = `/workspaces/${workspaceId}/projects/${project.$id}`
                const isActive = pathname === href
                return (
                    <Link href={href} key={project.$id}>
                        <div className={cn(
                            "flex items-center gap-2 p-2.5 font-medium rounded-md hover:opacity-75 transition text-neutral-500 cursor-pointer",
                            isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                        )}>
                            <ProjectAvatar name={project.name} image={project.imageUrl} className={""} />
                            <span className="truncate text-sm">{project.name}</span>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export default Projects
