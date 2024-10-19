import Image from "next/image"
import Link from "next/link"
import { Separator } from "./ui/separator"
import { Navigation } from "./navigation"
import WorkspaceSwtcher from "./workspace-swtcher"
import Projects from "./projects"

const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href="/">
                <Image src="/logo.svg" width={164} height={48} alt="logo" />
            </Link>
            <Separator className="my-4" />
            <WorkspaceSwtcher />
            <Separator className="my-4" />
            <Navigation />
            <Separator className="my-4" />
            <Projects />
        </aside>
    )
}

export default Sidebar
