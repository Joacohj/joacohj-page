'use client'
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Header from "@/src/components/Header";
import { Separator } from "@base-ui/react";
import { javascript } from '@codemirror/lang-javascript'
import { CopyIcon } from "@radix-ui/react-icons";
import CodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
interface Theme {
    theme: 'light' | 'dark'
}
export default function SkeletonPage() {
    const { theme } = useTheme()
    const [actualTheme, setActualTheme] = useState('light')

    useEffect(() => {
        const handleThemeChange = () => {
            setActualTheme(theme ?? 'light')
        }

        handleThemeChange()
    }, [theme])
    return <div>
        <Header enableProgress />
        <section className="w-full px-15 sm:px-30 xl:px-100 my-10">
            <article className="w-full rounded-xl h-[300px]">
                    <Skeleton className="w-full h-full"/>
            </article>
            <article className="w-full mt-15">
                <Skeleton className="w-[400px] h-8"/>
                <Skeleton className="w-full h-24 mt-4"/>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>
            <article className="w-full mt-15">
                <Skeleton className="w-[300px] h-6"/>
                <Skeleton className="w-full h-12 mt-4"/>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>

                       <article className="w-full mt-15">
                <Skeleton className="w-[400px] h-8"/>
                <Skeleton className="w-full h-24 mt-4"/>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>

        </section>
        <footer className="w-full bg-background border-accent border py-10">
            <p className="text-center  text-muted-foreground">Made with love by Joaquin Alvarez ❤</p>
            <nav className="flex w-full justify-center gap-4 text-muted-foreground">
                <a href="">about</a>
                <a href="">gallery</a>
                <a href="">blog</a>
                <a href="">projects</a>
            </nav>
        </footer>
    </div>
}