"use client"

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
  type LexicalCommand,
} from 'lexical';

import { useEffect } from 'react';

export function MarkdownPastePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const clipboardEvent = event as ClipboardEvent;

        const markdown = clipboardEvent.clipboardData?.getData('text/plain');

        if (!markdown) {
          return false;
        }

        // Solamente interceptamos contenido que parece Markdown.
        const looksLikeMarkdown =
          /^#{1,6}\s/m.test(markdown) ||
          /\*\*.+\*\*/s.test(markdown) ||
          /^[-*+]\s/m.test(markdown) ||
          /^\d+\.\s/m.test(markdown) ||
          /^>\s/m.test(markdown) ||
          /```/.test(markdown);

        if (!looksLikeMarkdown) {
          return false;
        }

        event.preventDefault();

        editor.update(() => {
          $convertFromMarkdownString(
            markdown,
            TRANSFORMERS,
          );
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}

export function MarkdownPlugin() {
  const [editor] = useLexicalComposerContext();

  const importMarkdown = (markdown: string) => {
    editor.update(() => {
      $convertFromMarkdownString(markdown, TRANSFORMERS);
    });
  };

  return null;
}