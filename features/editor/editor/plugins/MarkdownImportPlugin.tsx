"use client";
import {
  HEADING,
  ORDERED_LIST,
  UNORDERED_LIST,
  QUOTE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  $convertFromMarkdownString,
} from "@lexical/markdown";
import {
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  $isTextNode,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createMathNode, MathNode } from "./MathNode";
import { $createImageNode } from "./image-node";
import { uploadImage } from "./image-extension";
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
type MarkdownImage = {
  index: number;
  alt: string;
  mimeType: string;
  base64: string;
};
type MarkdownMath = { index: number; latex: string; display: boolean };
type MarkerNode = { index: number; key: string };
type Props = { markdown: string | null; onImported?: () => void };
function extractMarkdownImages(markdown: string): {
  markdown: string;
  images: MarkdownImage[];
} {
  const images: MarkdownImage[] = [];
  const imageRegex = /!\[([^\]]*)\]\(data:(image\/[^;]+);base64,([^)]+)\)/g;
  const processedMarkdown = markdown.replace(
    imageRegex,
    (_match, alt: string, mimeType: string, base64: string) => {
      const index = images.length;
      images.push({ index, alt, mimeType, base64 });
      return `[[MINERU_IMAGE_${index}]]`;
    },
  );
  return { markdown: processedMarkdown, images };
}
function extractMarkdownMath(markdown: string): {
  markdown: string;
  math: MarkdownMath[];
} {
  const math: MarkdownMath[] = [];
  let processedMarkdown = markdown.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_match, latex: string) => {
      const index = math.length;
      math.push({ index, latex: latex.trim(), display: true });
      return `[[MINERU_MATH_${index}]]`;
    },
  );
  processedMarkdown = processedMarkdown.replace(
    /(?<!\$)\$([^$\n]+?)\$(?!\$)/g,
    (_match, latex: string) => {
      const index = math.length;
      math.push({ index, latex: latex.trim(), display: false });
      return `[[MINERU_MATH_${index}]]`;
    },
  );
  return { markdown: processedMarkdown, math };
}
function base64ToFile(
  base64: string,
  mimeType: string,
  filename: string,
): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}
function findMarkerNode(node: LexicalNode, marker: string): LexicalNode | null {
  if ($isTextNode(node)) {
    if (node.getTextContent().includes(marker)) {
      return node;
    }
    return null;
  }
  if (!$isElementNode(node)) {
    return null;
  }
  for (const child of node.getChildren()) {
    const result = findMarkerNode(child, marker);
    if (result) {
      return result;
    }
  }
  return null;
}
function replaceMarkerWithNode(
  editor: LexicalEditor,
  markerKey: string,
  marker: string,
  createNode: () => LexicalNode,
): void {
  editor.update(() => {
    const node = $getNodeByKey(markerKey);
    if (!node || !$isTextNode(node)) {
      console.warn(
        `[MarkdownImportPlugin] No se encontró el TextNode ${markerKey}`,
      );
      return;
    }
    const text = node.getTextContent();
    const markerIndex = text.indexOf(marker);
    if (markerIndex === -1) {
      console.warn(
        `[MarkdownImportPlugin] No se encontró ${marker} dentro del TextNode`,
      );
      return;
    }
    const before = text.slice(0, markerIndex);
    const after = text.slice(markerIndex + marker.length);
    const replacementNode = createNode();
    if (!before && !after) {
      node.replace(replacementNode);
      return;
    }
    if (before) {
      node.setTextContent(before);
    } else {
      node.remove();
    }
    const parent = node.getParent();
    if (!parent) {
      return;
    }
    if (before) {
      node.insertAfter(replacementNode);
    } else {
      parent.append(replacementNode);
    }
    if (after) {
      const afterNode = $createTextNode(after);
      replacementNode.insertAfter(afterNode);
    }
  });
}
async function processImages(
  editor: LexicalEditor,
  images: MarkdownImage[],
  markerNodes: MarkerNode[],
): Promise<void> {
  for (const image of images) {
    const marker = `[[MINERU_IMAGE_${image.index}]]`;
    const markerInfo = markerNodes.find((item) => item.index === image.index);
    if (!markerInfo) {
      console.warn(
        `[MarkdownImportPlugin] No se encontró el marcador ${marker}`,
      );
      continue;
    }
    const extension = image.mimeType.split("/")[1] ?? "png";
    const file = base64ToFile(
      image.base64,
      image.mimeType,
      `mineru-image-${image.index}.${extension}`,
    );
    try {
      console.log(`[MarkdownImportPlugin] Subiendo imagen ${image.index}...`);
      const uploaded = await uploadImage(file);
      console.log(
        `[MarkdownImportPlugin] Imagen ${image.index} subida:`,
        uploaded,
      );
      replaceMarkerWithNode(editor, markerInfo.key, marker, () =>
        $createImageNode(
          uploaded.src,
          image.alt || uploaded.altText || "",
          uploaded.width,
          uploaded.height,
        ),
      );
    } catch (error) {
      console.error(
        `[MarkdownImportPlugin] Error procesando imagen ${image.index}:`,
        error,
      );
    }
  }
}
function processMath(
  editor: LexicalEditor,
  math: MarkdownMath[],
  markerNodes: MarkerNode[],
): void {
  for (const item of math) {
    const marker = `[[MINERU_MATH_${item.index}]]`;
    const markerInfo = markerNodes.find(
      (markerNode) => markerNode.index === item.index,
    );
    if (!markerInfo) {
      console.warn(
        `[MarkdownImportPlugin] No se encontró el marcador ${marker}`,
      );
      continue;
    }
    replaceMarkerWithNode(editor, markerInfo.key, marker, () =>
      $createMathNode(item.latex, item.display),
    );
  }
}
export function MarkdownImportPlugin({ markdown, onImported }: Props) {
  const [editor] = useLexicalComposerContext();
  const importedMarkdown = useRef<string | null>(null);
  useEffect(() => {
    if (!markdown) {
      return;
    }
    if (importedMarkdown.current === markdown) {
      return;
    }
    importedMarkdown.current = markdown;
    const { markdown: markdownWithoutImages, images } =
      extractMarkdownImages(markdown);
    const { markdown: processedMarkdown, math } = extractMarkdownMath(
      markdownWithoutImages,
    );
    console.log("[MarkdownImportPlugin] imágenes encontradas:", images.length);
    console.log("[MarkdownImportPlugin] fórmulas encontradas:", math.length);
    const imageMarkerNodes: MarkerNode[] = [];
    const mathMarkerNodes: MarkerNode[] = [];
    editor.update(() => {
      $convertFromMarkdownString(processedMarkdown, MARKDOWN_TRANSFORMERS);
      const root = $getRoot();
      console.log(
        "[MarkdownImportPlugin] contenido Lexical:",
        root.getTextContent(),
      );
      for (const image of images) {
        const marker = `[[MINERU_IMAGE_${image.index}]]`;
        const node = findMarkerNode(root, marker);
        if (!node) {
          console.warn(`[MarkdownImportPlugin] No se encontró ${marker}`);
          continue;
        }
        imageMarkerNodes.push({ index: image.index, key: node.getKey() });
        console.log(
          `[MarkdownImportPlugin] ${marker} encontrado:`,
          node.getKey(),
        );
      }
      for (const item of math) {
        const marker = `[[MINERU_MATH_${item.index}]]`;
        const node = findMarkerNode(root, marker);
        if (!node) {
          console.warn(`[MarkdownImportPlugin] No se encontró ${marker}`);
          continue;
        }
        mathMarkerNodes.push({ index: item.index, key: node.getKey() });
        console.log(
          `[MarkdownImportPlugin] ${marker} encontrado:`,
          node.getKey(),
        );
      }
    });
    processMath(editor, math, mathMarkerNodes);
    if (images.length > 0) {
      void processImages(editor, images, imageMarkerNodes);
    }
    onImported?.();
  }, [editor, markdown, onImported]);
  return null;
}
