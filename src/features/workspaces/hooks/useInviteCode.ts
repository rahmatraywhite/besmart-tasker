import { useParams } from "next/navigation";

export const useInvitedCode = () => {
    const params = useParams();
    console.log('Params:', params);
    return params.inviteCode as string
}