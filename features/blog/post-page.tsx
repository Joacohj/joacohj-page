'use client'
import { Button } from "@/components/ui/button";
import { Separator } from "@base-ui/react";
import { javascript } from '@codemirror/lang-javascript'
import { CopyIcon } from "@radix-ui/react-icons";
import CodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/site-header";
import BlogContent from "@/components/shared/posts/blogContent";
interface Theme {
    theme: 'light' | 'dark'
}
type Post = {
    banner: string;
    createdAt: Date;
    id: string;
    title: string;
    description: string;
    jsonContent: string;

}

export default function PostPage({ banner, createdAt, id, title, description, jsonContent }: Post) {
    const { theme } = useTheme()
    const [actualTheme, setActualTheme] = useState('light')
    const content = JSON.parse(jsonContent)

    useEffect(() => {
        const handleThemeChange = () => {
            setActualTheme(theme ?? 'light')
        }

        handleThemeChange()
    }, [theme])
    return <div>
        <Header enableProgress />
        <section className="w-full px-15 sm:px-30 xl:px-100 my-10">
            <article className="w-full rounded-xl h-[300px] overflow-hidden">
                <img src={banner} alt={title} className="w-full h-full object-cover" />
            </article>
            <article className="w-full">
                <h3 className="mt-15 text-4xl font-semibold text-foreground">{title}</h3>
                <p className="text-muted-foreground mt-2 text-xl font-light" >{description}</p>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>

            <article className="w-full mt-10">
                <BlogContent jsonContent={jsonContent} />
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