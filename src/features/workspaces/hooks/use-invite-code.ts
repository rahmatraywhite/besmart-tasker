import { useParams } from "next/navigation";

export const useInviteCode = () => {
    const params = useParams();
    console.log('Params:', params);
    return params.invitCode as string;
};
