'use client';

import { useEffect, useRef } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import {
  $convertFromMarkdownString,
} from '@lexical/markdown';

import {
  uploadAndInsertImage,
  type ImageUploadFunction,
} from './image-extension';

import type { MarkdownImage } from './markdown-images';

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
type MarkdownImportPluginProps = {
  markdown: string | null;
  images: MarkdownImage[];
  uploadImage: ImageUploadFunction;
  onImported?: () => void;
};

export function MarkdownImportPlugin({
  markdown,
  images,
  uploadImage,
  onImported,
}: MarkdownImportPluginProps) {
  const [editor] = useLexicalComposerContext();

  const imported = useRef<string | null>(null);

  useEffect(() => {
    if (!markdown) {
      return;
    }

    if (imported.current === markdown) {
      return;
    }

    imported.current = markdown;

    editor.update(() => {
      $convertFromMarkdownString(
        markdown,
        MARKDOWN_TRANSFORMERS,
      );
    });

    for (const image of images) {
      void uploadAndInsertImage(
        editor,
        image.file,
        uploadImage,
      );
    }

    onImported?.();
  }, [
    editor,
    markdown,
    images,
    uploadImage,
    onImported,
  ]);

  return null;
}