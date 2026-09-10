'use client'

import SignInForm from "@/src/components/auth/SignIn";
import { Separator } from "@base-ui/react";


export default function AuthPage() {
    return <section className="w-full h-svh flex justify-center items-center text-foreground flex-col">
        <div>
            <div>
                <h3 className="text-4xl font-semibold">Welcome Joacohj.</h3>
                <p className="text-xl text-muted-foreground font-light">Dashboard page access</p>
            </div>
            <Separator className='bg-accent w-full h-0.5 my-3 rounded-xl' />
            <SignInForm />
        </div>
    </section>
}