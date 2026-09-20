'use client'

import Header from "@/app/components/ui/site-header";
import { Separator } from "@base-ui/react";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function SkeletonPage() {
    const { theme } = useTheme()
    const [, setActualTheme] = useState('light')

    useEffect(() => {
        const handleThemeChange = () => {
            setActualTheme(theme ?? 'light')
        }

        handleThemeChange()
    }, [theme])
    return <div>
        <Header enableProgress />
        <section className="w-full px-15 sm:px-30 xl:px-100 my-10">
            <article className="w-full rounded-xl h-75">
                    <Skeleton className="w-full h-full"/>
            </article>
            <article className="w-full mt-15">
                <Skeleton className="w-100 h-8"/>
                <Skeleton className="w-full h-24 mt-4"/>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>
            <article className="w-full mt-15">
                <Skeleton className="w-75 h-6"/>
                <Skeleton className="w-full h-12 mt-4"/>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>

                       <article className="w-full mt-15">
                <Skeleton className="w-100 h-8"/>
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