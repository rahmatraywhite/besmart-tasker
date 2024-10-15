import { getCurrent } from "@/features/auth/actions";
import { UserButton } from "@/features/auth/components/user-button";
import { redirect } from "next/navigation";


export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <UserButton />
    </div>
  );
}
