'use client';

import { CodeMirrorExtension } from '@/features/editor/editor/plugins/code-mirror-extension';
import { ImageExtension } from '@/features/editor/editor/plugins/image-extension';
import { ClickAfterLastBlockExtension, SelectBlockExtension, TabIndentationExtension } from '@lexical/extension';
import { HistoryExtension } from '@lexical/history';
import { ListExtension } from '@lexical/list';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { RichTextExtension } from '@lexical/rich-text';
import { defineExtension } from 'lexical';


const theme = {
    heading: {
        h1: 'mt-2 mb-1 text-[2rem] font-bold leading-[1.25]',
        h2: 'mt-2 mb-[0.15rem] text-[1.5rem] font-semibold leading-[1.3]',
        h3: 'mt-[0.4rem] mb-[0.1rem] text-[1.3rem] font-semibold leading-[1.35]',
    },

    list: {
        listitem: 'my-[0.1rem] text-[1.1rem] leading-[1.65]',
        ol: 'my-[0.2rem] pl-5 list-decimal',
        ul: 'my-[0.2rem] pl-5 list-disc',
    },

    paragraph:
        'my-0 py-0.5 text-[1.1rem] leading-[1.65]',

    quote:
        'my-[0.4rem] border-l-[3px] border-zinc-300 pl-3.5 text-[1.1rem] italic leading-[1.65] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',

    text: {
        bold: 'font-bold',
        code: 'rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.3em] py-[0.1em] font-mono text-[0.95em] dark:bg-white/10',
        italic: 'italic',
    },
};
type BlogContentProps = {
    jsonContent: string;
};

export default function BlogContent({
    jsonContent,
}: BlogContentProps) {
    const blogExtension = defineExtension({
        name: '@my-app/blog-viewer',

        namespace: '@my-app/blog-viewer',

        theme,
        editable: false,
        dependencies: [
            RichTextExtension,
            HistoryExtension,
            ListExtension,
            CodeMirrorExtension,
            ImageExtension,
        ],

        $initialEditorState(editor) {
            const editorState = editor.parseEditorState(jsonContent);

            editor.setEditorState(editorState);
        },
    });

    return (
        <LexicalExtensionComposer
            extension={blogExtension}
            contentEditable={null}
        >
            <ContentEditable
                className="w-full outline-none"
                aria-label="Blog content"
            />
        </LexicalExtensionComposer>
    );
}