'use client'

import { ImageIcon, UploadIcon } from "@radix-ui/react-icons"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import ImageForm from "../components/FileForm"
import FileForm from "../components/FileForm"

export default function FeedPage() {
    return <section className="w-full flex flex-col  px-5 sm:px-15 xl:px-30 mt-10">
        <article>
            <h4 className="text-2xl font-semibold text-foreground">Feed</h4>
            <p className="text-xl text-muted-foreground">Lorem ipsum dolor sit amet consectetur.</p>
        </article>

        <article className="w-full mt-10">
            <FileForm/>
        </article>
    </section>
}