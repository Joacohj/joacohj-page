'use client'
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@base-ui/react";
import { EnvelopeClosedIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { EyeClosedIcon } from "lucide-react";

export default function AuthPage() {
    return <section className="w-full h-svh flex justify-center items-center text-foreground flex-col">
        <div>
            <div>
                <h3 className="text-4xl font-semibold">Welcome Joacohj.</h3>
                <p className="text-xl text-muted-foreground font-light">Dashboard page access</p>
            </div>
            <Separator className='bg-accent w-full h-0.5 my-3 rounded-xl'/>
            <FieldGroup className="mt-5">
                <Field>
                    <FieldSet>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <InputGroup className="py-5">
                            <InputGroupInput id="email" placeholder="jhondoe@example.com" />
                            <InputGroupAddon>
                                <EnvelopeClosedIcon />
                            </InputGroupAddon>
                        </InputGroup>
                    </FieldSet>
                </Field>
                <Field>
                    <FieldSet>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <InputGroup className="py-5">
                            <InputGroupInput id="password" type="password" placeholder="●●●●●●●●●●" />
                            <InputGroupAddon align={"inline-end"}>
                                <Button variant={'ghost'}>
                                    <EyeClosedIcon />
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FieldSet>
                </Field>
                <Field>
                    <FieldSet className="flex flex-row">
                        <Checkbox id="remember" name="remember" className='items-center justify-center' />
                        <FieldLabel htmlFor="remember">Remember Device <InfoCircledIcon/></FieldLabel>
                    </FieldSet>
                </Field>
            </FieldGroup>
            <Button className=" flex items-center gap-2 w-full px-20 py-6 mt-10">
                Sign In

            </Button>
        </div>
    </section>
}