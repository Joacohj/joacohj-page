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
import SkeletonPage from "./components/skeletonPage";
interface Theme {
    theme: 'light' | 'dark'
}
export default function PostPage() {
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
            <article className="w-full">
                <h3 className="mt-15 text-4xl font-semibold text-foreground">Joaquin Alvarez Portfolio</h3>
                <p className="text-muted-foreground mt-2 text-xl font-light" >Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium amet aliquid inventore fugit nihil ratione obcaecati rerum nisi voluptate, quae deleniti dolore tenetur nam! A dolores molestias perferendis reiciendis impedit.</p>
                <Separator className='w-full h-0.5 bg-accent my-5' />
            </article>

            <article className="w-full">
                <h4 className="mt-15 text-2xl font-semibold text-foreground">Bla Bla Bla</h4>
                <p className="text-muted-foreground mt-2 font-light" >Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium amet aliquid inventore fugit nihil ratione obcaecati rerum nisi voluptate, quae deleniti dolore tenetur nam! A dolores molestias perferendis reiciendis impedit.</p>
            </article>

            <article className="w-full mt-10">
                <div className="overflow-hidden relative border border-accent  bg-primary text-xl">
                    <Button className='absolute z-30 p-3 top-2 right-2' variant={'ghost'}>
                        <CopyIcon width={25} height={25} className="text-muted-foreground" />
                    </Button>
                    <CodeMirror
                        value={`console.log('hello world')`}
                        editable={false}
                        height="200px"
                        extensions={[javascript({ jsx: true, typescript: true })]}
                        theme={actualTheme == 'light' ? 'light' : 'dark'}
                        basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            highlightActiveLine: true,
                            autocompletion: true,
                        }}
                    />
                </div>
            </article>

            <article className="w-full">
                <h4 className="mt-15 text-2xl font-semibold text-foreground">Bla Bla Bla</h4>
                <p className="text-muted-foreground mt-2 font-light" >Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse saepe cumque odit officiis quia enim, excepturi quibusdam accusamus velit, maxime sed, fugiat similique sequi numquam ad assumenda! Dolorem, atque repellat?
                    Quod totam possimus rem inventore, delectus blanditiis. Asperiores impedit sapiente, ab corporis et voluptatem corrupti vitae hic blanditiis, veniam fugit? Eligendi voluptatum quidem officiis rem excepturi maxime? Officiis, qui quaerat.
                    Sunt aspernatur eum, neque soluta id error, expedita officia deleniti quaerat illum provident assumenda exercitationem corporis? Magni sunt dolores perspiciatis quisquam natus maiores debitis doloribus? Expedita cupiditate molestiae ad et?
                    Laboriosam deleniti et explicabo voluptates aut quae id natus provident sed eius quo placeat distinctio commodi eos, voluptatem minus exercitationem omnis odio ipsam in dolorum magnam. Possimus voluptatem neque error!
                    Reiciendis, aspernatur. Velit, quos dolorum! Perferendis explicabo dolore quibusdam omnis, beatae atque quos nisi rerum nemo sequi! Odit vel a quia ratione magni, ipsa nesciunt labore iste porro dolorum consectetur!</p>
            </article>
            <article className="w-full">
                <h4 className="mt-15 text-2xl font-semibold text-foreground">Bla Bla Bla</h4>
                <p className="text-muted-foreground mt-2 font-light" >Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse saepe cumque odit officiis quia enim, excepturi quibusdam accusamus velit, maxime sed, fugiat similique sequi numquam ad assumenda! Dolorem, atque repellat?
                    Quod totam possimus rem inventore, delectus blanditiis. Asperiores impedit sapiente, ab corporis et voluptatem corrupti vitae hic blanditiis, veniam fugit? Eligendi voluptatum quidem officiis rem excepturi maxime? Officiis, qui quaerat.
                    Sunt aspernatur eum, neque soluta id error, expedita officia deleniti quaerat illum provident assumenda exercitationem corporis? Magni sunt dolores perspiciatis quisquam natus maiores debitis doloribus? Expedita cupiditate molestiae ad et?
                    Laboriosam deleniti et explicabo voluptates aut quae id natus provident sed eius quo placeat distinctio commodi eos, voluptatem minus exercitationem omnis odio ipsam in dolorum magnam. Possimus voluptatem neque error!
                    Reiciendis, aspernatur. Velit, quos dolorum! Perferendis explicabo dolore quibusdam omnis, beatae atque quos nisi rerum nemo sequi! Odit vel a quia ratione magni, ipsa nesciunt labore iste porro dolorum consectetur!</p>
            </article>
            <article className="w-full">
                <h4 className="mt-15 text-2xl font-semibold text-foreground">Bla Bla Bla</h4>
                <p className="text-muted-foreground mt-2 font-light" >Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse saepe cumque odit officiis quia enim, excepturi quibusdam accusamus velit, maxime sed, fugiat similique sequi numquam ad assumenda! Dolorem, atque repellat?
                    Quod totam possimus rem inventore, delectus blanditiis. Asperiores impedit sapiente, ab corporis et voluptatem corrupti vitae hic blanditiis, veniam fugit? Eligendi voluptatum quidem officiis rem excepturi maxime? Officiis, qui quaerat.
                    Sunt aspernatur eum, neque soluta id error, expedita officia deleniti quaerat illum provident assumenda exercitationem corporis? Magni sunt dolores perspiciatis quisquam natus maiores debitis doloribus? Expedita cupiditate molestiae ad et?
                    Laboriosam deleniti et explicabo voluptates aut quae id natus provident sed eius quo placeat distinctio commodi eos, voluptatem minus exercitationem omnis odio ipsam in dolorum magnam. Possimus voluptatem neque error!
                    Reiciendis, aspernatur. Velit, quos dolorum! Perferendis explicabo dolore quibusdam omnis, beatae atque quos nisi rerum nemo sequi! Odit vel a quia ratione magni, ipsa nesciunt labore iste porro dolorum consectetur!</p>
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