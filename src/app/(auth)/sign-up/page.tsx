import { getCurrent } from '@/features/auth/actions'
import SignUpCard from '@/features/auth/components/sign_up_card'
import { redirect } from 'next/navigation'

const SignUpPage = async () => {
    const user = await getCurrent()
    if (user) redirect('/')
    return (
        <SignUpCard />
    )
}

export default SignUpPage