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
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useEditorStore } from '@/app/[locale]/dashboard/blog/create/page';
const editorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    ListExtension,
    TabIndentationExtension,
    ClickAfterLastBlockExtension,
    SelectBlockExtension,
    CodeMirrorExtension,
    ImageExtension
  ],
  name: '@lexical/website/notion-like-editor',
  namespace: '@lexical/website/notion-like-editor',
  theme,
});
export default function Editor() {
  const [anchorElem, setAnchorElem] = useState<HTMLElement | null>(null);
  const setJson = useEditorStore((state => state.setJson))
  return (
    <LexicalExtensionComposer
      extension={editorExtension}
      contentEditable={null}>
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
          <OnChangePlugin
            onChange={(editorState) => {
              const json = editorState.toJSON();

              setJson(JSON.stringify(json))
            }}
          />
          <SlashMenuPlugin />
          {anchorElem ? <DragPlugin anchorElem={anchorElem} /> : null}
        </div>
        <div className='absolute bottom-3 right-3'><Button className=" flex items-center justify-center p-3" variant={'outline'}><SparklesIcon className='font-extralight' /></Button></div>
      </div>
    </LexicalExtensionComposer>
  );
}
