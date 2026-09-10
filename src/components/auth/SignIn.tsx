"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { EnvelopeClosedIcon, EyeOpenIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { EyeClosedIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";


import {
    signInSchema,
    type SignInForm
} from "@/lib/schemas/auth"
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { SignIn } from "@/actions";



export default function SignInForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const {
        register,
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false
        }
    })

    const onSubmit = async (data: SignInForm) => {
        try {
            setIsLoading(true);

            const result = await SignIn(data);
            if (!result?.success) {
                setError("root", {
                    type: 'server',
                    message: "Invalid Email or Password"
                })
            }

        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    };

    function handleChangePassword(): void {
        setShowPassword(prev => !prev)
    }

    return <form onSubmit={handleSubmit(onSubmit)}>

        <FieldGroup className="mt-5">
            <FieldError>
                {errors.root && errors.root.message}
            </FieldError>
            <Field>
                <FieldSet>
                    <FieldLabel htmlFor="email">Email</FieldLabel>

                    <InputGroup className="py-5">
                        <InputGroupInput {...register("email")} id="email" placeholder="jhondoe@example.com" />
                        <InputGroupAddon>
                            <EnvelopeClosedIcon />
                        </InputGroupAddon>
                    </InputGroup>
                    <FieldError>
                        {errors.email && errors.email.message}
                    </FieldError>
                </FieldSet>
            </Field>
            <Field>
                <FieldSet>
                    <FieldLabel htmlFor="password">Password</FieldLabel>

                    <InputGroup className="py-5">
                        <InputGroupInput {...register("password")} id="password" type={showPassword ? 'text' : 'password'} placeholder="●●●●●●●●●●" />
                        <InputGroupAddon align={"inline-end"}>
                            <Button variant={'ghost'} onClick={handleChangePassword}>
                                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                    <FieldError>
                        {errors.password && errors.password.message}
                    </FieldError>
                </FieldSet>
            </Field>
            <Field>
                <FieldSet className="flex flex-row">
                    <Controller
                        name="rememberMe"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="remember"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="items-center justify-center"
                            />
                        )}
                    />
                    <FieldLabel htmlFor="remember">Remember Device <InfoCircledIcon /></FieldLabel>
                </FieldSet>
            </Field>
        </FieldGroup>
        <Button type="submit" className=" flex items-center justify-center gap-2 w-full px-20 py-5 mt-10">
            {isLoading && <Spinner />}
            Sign In
        </Button>
    </form>
}