"use server";

import { SignInForm, signInSchema } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";
import { SignIn as SignInService } from "@/services"
export async function SignIn(values: SignInForm) {
    const parsed = signInSchema.safeParse(values);

    if (!parsed.success) {
        return {
            success: false,
            error: "Datos inválidos",
        };
    }

    const { email, password, rememberMe } = parsed.data;

    let data;

    try {
        data = await SignInService({
            email,
            password,
            rememberMe,
        });
    } catch (error) {
        console.error("Better Auth error:", error);

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Error al iniciar sesión",
        };
    }

    if (data.url) {
        redirect(data.url);
    }

    return {
        success: false,
        error: "No se pudo iniciar sesión",
    };
}