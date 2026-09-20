'use client';

import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  DROP_COMMAND,
  PASTE_COMMAND,
  defineExtension,
  type LexicalEditor,
  type PasteCommandType,
} from 'lexical';

import { ImageNode, $createImageNode } from './ImageNode';

export type ImageUploadResult = {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
};

export type ImageUploadFunction = (
  file: File,
) => Promise<ImageUploadResult>;

export type ImageExtensionConfig = {
  uploadImage: ImageUploadFunction;
};

function getImageFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files).filter((file) =>
    file.type.startsWith('image/'),
  );
}

function insertImage(
  editor: LexicalEditor,
  image: ImageUploadResult,
): void {
  editor.update(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    const imageNode = $createImageNode(
      image.src,
      image.altText ?? '',
      image.width,
      image.height,
    );

    $insertNodes([imageNode]);
  });
}

async function uploadAndInsert(
  editor: LexicalEditor,
  file: File,
  uploadImage: ImageUploadFunction,
): Promise<void> {
  try {
    const image = await uploadImage(file);

    insertImage(editor, image);
  } catch (error) {
    console.error('Failed to upload image:', error);
  }
}

function handleDrop(
  editor: LexicalEditor,
  uploadImage: ImageUploadFunction,
  event: DragEvent,
): boolean {
  if (!event.dataTransfer) {
    return false;
  }

  const files = getImageFiles(event.dataTransfer);

  if (files.length === 0) {
    return false;
  }

  event.preventDefault();

  for (const file of files) {
    void uploadAndInsert(
      editor,
      file,
      uploadImage,
    );
  }

  return true;
}

function handlePaste(
  editor: LexicalEditor,
  uploadImage: ImageUploadFunction,
  event: PasteCommandType,
): boolean {
  if (!(event instanceof ClipboardEvent)) {
    return false;
  }

  const { clipboardData } = event;

  if (!clipboardData) {
    return false;
  }

  const files = Array.from(clipboardData.files).filter(
    (file) => file.type.startsWith('image/'),
  );

  if (files.length === 0) {
    return false;
  }

  event.preventDefault();

  for (const file of files) {
    void uploadAndInsert(
      editor,
      file,
      uploadImage,
    );
  }

  return true;
}

export function createImageExtension(
  config: ImageExtensionConfig,
) {
  return defineExtension({
    name: '@my-app/image',

    nodes: () => [ImageNode],

    register: (editor) => {
      const unregisterDrop = editor.registerCommand(
        DROP_COMMAND,
        (event) =>
          handleDrop(
            editor,
            config.uploadImage,
            event,
          ),
        COMMAND_PRIORITY_HIGH,
      );

      const unregisterPaste = editor.registerCommand(
        PASTE_COMMAND,
        (event) =>
          handlePaste(
            editor,
            config.uploadImage,
            event,
          ),
        COMMAND_PRIORITY_HIGH,
      );

      return () => {
        unregisterDrop();
        unregisterPaste();
      };
    },
  });
}

export const ImageExtension = createImageExtension({
  uploadImage: async (file) => {
    const src = URL.createObjectURL(file);

    return {
      src,
      altText: file.name,
    };
  },
});