'use client'
import {
  ClickAfterLastBlockExtension,
  SelectBlockExtension,
  TabIndentationExtension,
} from '@lexical/extension';
import { HistoryExtension } from '@lexical/history';
import { ListExtension } from '@lexical/list';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { RichTextExtension } from '@lexical/rich-text';
import { defineExtension } from 'lexical';
import { useState } from 'react';

import { DragPlugin } from "./plugins/drag-plugin";
import { SlashMenuPlugin } from './plugins/slash-menu-plugin';
import { CodeMirrorExtension } from './plugins/code-mirror-extension';
import { ImageExtension } from './plugins/image-extension';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from 'lucide-react';

const theme = {
  heading: {
    h1: 'mt-2 mb-1 text-[1.75rem] font-bold leading-[1.25]',
    h2: 'mt-2 mb-[0.15rem] text-[1.3rem] font-semibold leading-[1.3]',
    h3: 'mt-[0.4rem] mb-[0.1rem] text-[1.1rem] font-semibold leading-[1.35]',
  },
  list: {
    listitem: 'my-[0.1rem] leading-[1.6]',
    ol: 'my-[0.2rem] pl-5 list-decimal',
    ul: 'my-[0.2rem] pl-5 list-disc',
  },
  paragraph: 'my-0 py-0.5 leading-[1.6]',
  quote:
    'my-[0.4rem] border-l-[3px] [border-left-style:solid] border-zinc-300 pl-3.5 italic text-zinc-500 dark:border-zinc-700 dark:text-zinc-400',
  text: {
    bold: 'font-bold',
    code: 'rounded-[3px] bg-[rgba(135,131,120,0.15)] px-[0.3em] py-[0.1em] font-mono text-[0.875em] dark:bg-white/10',
    italic: 'italic',
  },
};

import { TRANSFORMERS } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useEditorStore } from '@/app/[locale]/dashboard/blog/create/page';
import { FilePlusIcon } from '@radix-ui/react-icons';

import {
  HEADING,
  ORDERED_LIST,
  UNORDERED_LIST,
  QUOTE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
} from '@lexical/markdown';

const MARKDOWN_TRANSFORMERS = [
  HEADING,
  ORDERED_LIST,
  UNORDERED_LIST,
  QUOTE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
];
import { MarkdownPastePlugin, MarkdownPlugin } from './plugins/markdown-plugin';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MarkdownPdfUploadForm } from '../markdown-pdf-upload-form';
import { MarkdownImportPlugin } from './plugins/MarkdownImportPlugin';
import TextAssistent from '../text-assistant';
import { MarkdownAssistant } from '../markdown-assistant';
const editorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    TabIndentationExtension,
    ClickAfterLastBlockExtension,
    SelectBlockExtension,
    CodeMirrorExtension,
    MarkdownPlugin,
    ImageExtension,
    MarkdownShortcutPlugin
  ],
  name: '@lexical/website/notion-like-editor',
  namespace: '@lexical/website/notion-like-editor',
  theme,
});
export default function Editor() {
  const [markdownToImport, setMarkdownToImport] =
    useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false)
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);
  const setJson = useEditorStore((state => state.setJson))
  return (
    <LexicalExtensionComposer
      extension={editorExtension}
      contentEditable={null}
    >
      <div className="relative min-w-0 max-w-full overflow-hidden rounded-lg border border-input bg-secondary">

        <div
          className="relative min-w-0 max-w-full"
          ref={setAnchorElem}
        >
          <ContentEditable
            className="h-[600px] w-full overflow-x-hidden overflow-y-auto px-8 py-5 outline-none xl:h-[400px]"
            aria-label="Rich text editor"
            aria-placeholder="Type '/' for commands..."
            placeholder={
              <div className="pointer-events-none absolute top-[22px] left-8 select-none text-[0.95rem] text-muted-foreground">
                Type &apos;/&apos; for commands...
              </div>
            }
          />
          <MarkdownPastePlugin />
          <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />

          <OnChangePlugin
            onChange={(editorState) => {
              const json = editorState.toJSON();
              setJson(JSON.stringify(json));
            }}
          />

          <SlashMenuPlugin />

          {anchorElem ? (
            <DragPlugin anchorElem={anchorElem} />
          ) : null}
        </div>
        <div className="absolute flex bottom-3 right-3">
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Dialog onOpenChange={(open) => setOpen(open)} open={open}>
              <DialogTrigger 
                render={
                  <Button
                  onClick={() => setOpen(true)}
                    className="flex items-center justify-center p-3"
                    variant="outline"
                  >
                    <FilePlusIcon className="font-extralight" />
                  </Button>
                }
              />

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Upload a PDF or Markdown File
                  </DialogTitle>
                </DialogHeader>

                <MarkdownPdfUploadForm
                  onMarkdown={(markdown) => {
                    setMarkdownToImport(markdown);
                    setOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>

           <Dialog >
            <DialogTrigger render={ <Button
              className="flex items-center justify-center p-3"
              variant="outline"
            >
              <SparklesIcon className="font-extralight" />
            </Button>}/>
            <DialogContent  className={" [&>button]:hidden ring-0 bg-transparent p-2 xl:max-w-[550px] h-[70vh] scrollbar-none"}>
              {/* <DialogHeader><DialogTitle>Text assistent</DialogTitle></DialogHeader> */}
              <MarkdownAssistant/>
            </DialogContent>
           </Dialog>
          </div>
        </div>
      </div>
      <MarkdownImportPlugin
        markdown={markdownToImport}
        onImported={() => {
          setMarkdownToImport(null);
        }}
      />
    </LexicalExtensionComposer>
  );
}
