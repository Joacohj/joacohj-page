import { z } from "zod";
import { useTranslations } from "next-intl";

// const t = useTranslations("auth.signIn");

export const signInSchema = z.object({
    email: z
        .string()
        .email("Ingresa un email válido"),

    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
    rememberMe: z.boolean(),
});

export type SignInForm = z.infer<typeof signInSchema>;