import MembersList from "@/features/auth/components/members-list";
import { getCurrent } from "@/features/auth/queries"
import { redirect } from "next/navigation";

const WorkspaceIdMembersPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return (
        <div className="w-full lg:max-w-xl">
            <MembersList />
        </div>
    )
}

export default WorkspaceIdMembersPage
