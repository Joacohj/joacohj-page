import { auth } from "@/lib/auth";
import { locale } from "next/root-params";

export async function SignIn({ email, password, rememberMe }: { email: string, password: string, rememberMe: boolean }) {
    try {
        return await auth.api.signInEmail({
            body: {
                email,
                password,
                rememberMe,
                callbackURL: `${process.env.BETTER_AUTH_URL}/dashboard/overview`
            },

        })
    } catch (error) {
        throw error
    }
}


export async function SignUp({ name, email, password }: { name: string; email: string; password: string; }) {
    await auth.api.signUpEmail({
        body: {
            email,
            name,
            password
        }
    })
}