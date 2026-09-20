'use client';

import {useDropzone} from 'react-dropzone';
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  type LexicalEditor,
} from 'lexical';

import {$createImageNode} from './editor/plugins/ImageNode';
import type {ImageUploadFunction} from './editor/plugins/ImageExtension';

type ImageDropzoneProps = {
  editor: LexicalEditor;
  uploadImage: ImageUploadFunction;
  onComplete: () => void;
};

export function ImageDropzone({
  editor,
  uploadImage,
  onComplete,
}: ImageDropzoneProps) {
  const {getRootProps, getInputProps, isDragActive} =
    useDropzone({
      accept: {
        'image/*': [],
      },
      multiple: false,

      onDrop: async (files) => {
        const file = files[0];

        if (!file) {
          return;
        }

        try {
          const image = await uploadImage(file);

          editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
              return;
            }

            const imageNode = $createImageNode(
              image.src,
              image.altText ?? file.name,
              image.width,
              image.height,
            );

            $insertNodes([imageNode]);
          });

          onComplete();
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      },
    });

  return (
    <div
      {...getRootProps()}
      className={[
        'flex min-h-40 cursor-pointer flex-col',
        'items-center justify-center rounded-lg',
        'border border-dashed p-6 text-center',
        'transition-colors',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted/50',
      ].join(' ')}
    >
      <input {...getInputProps()} />

      <p className="text-sm font-medium">
        {isDragActive
          ? 'Soltá la imagen acá'
          : 'Arrastrá una imagen acá'}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        o hacé click para seleccionar
      </p>
    </div>
  );
}