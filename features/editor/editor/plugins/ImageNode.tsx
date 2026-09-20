'use client';

import type { JSX } from 'react';

import {
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical';
import { ResizableImage } from '../../ResizableImage';

export type SerializedImageNode = {
  type: 'image';
  version: 1;
  src: string;
  altText: string;
  width: number | null;
  height: number | null;
} & SerializedLexicalNode;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | null;
  __height: number | null;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(
    serializedNode: SerializedImageNode,
  ): ImageNode {
    return new ImageNode(
      serializedNode.src,
      serializedNode.altText,
      serializedNode.width ?? undefined,
      serializedNode.height ?? undefined,
    );
  }

  constructor(
    src = '',
    altText = '',
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key);

    this.__src = src;
    this.__altText = altText;
    this.__width = width ?? null;
    this.__height = height ?? null;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const wrapper = document.createElement('div');

    wrapper.className = 'my-4';

    return wrapper;
  }

  updateDOM(
    _prevNode: ImageNode,
    _dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    return false;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    };
  }
  setWidthAndHeight(width: number, height: number) {
    const writable = this.getWritable();

    writable.__width = width;
    writable.__height = height;
  }
  decorate(): JSX.Element { return ( <ResizableImage nodeKey={this.__key} src={this.__src} altText={this.__altText} width={this.__width} height={this.__height} /> ); } }

export function $createImageNode(
  src: string,
  altText = '',
  width?: number,
  height?: number,
): ImageNode {
  return new ImageNode(
    src,
    altText,
    width,
    height,
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}