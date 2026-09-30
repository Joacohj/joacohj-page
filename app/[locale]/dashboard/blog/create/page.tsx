'use client'

import Editor from "@/features/editor/editor/rich-text-editor";
import { FormSheet } from "@/features/blog/form-sheet";
import { create } from "zustand";

type EditorStoreFields = {
    json: string;
}

type EditorStoreActions = {
    setJson: (json: string) => void
}

type EditorStore = EditorStoreFields & EditorStoreActions
export const useEditorStore = create<EditorStore>()((set) => ({
    json: "",
    setJson: (json) => set(() => ({ json: json }))
}))

export default function CreatePage() {
    
    return <section className="w-full px-5 sm:px-15 xl:px-30 mt-10">
        <article>
            <h3 className="text-foreground text-2xl">Create Post</h3>
            <p className="text-muted-foreground">Here you can create a blog entry as post</p>
        </article>
        <article className="my-5">
            <FormSheet />
        </article>
        <section className="w-full gap-10">
            <article className="w-full overflow-hidden" >
                <Editor />
            </article>
        </section>
    </section>
}