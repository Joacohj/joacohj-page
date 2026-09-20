import {
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical';
import type { ReactElement } from 'react';
import { CodeMirrorEditor } from '../../CodeMirror';


export type SerializedCodeMirrorNode = SerializedLexicalNode & {
  type: 'codemirror';
  version: 1;
  code: string;
  language: string;
};

export class CodeMirrorNode extends DecoratorNode<ReactElement> {
  __code: string;
  __language: string;

  static getType(): string {
    return 'codemirror';
  }

  static clone(node: CodeMirrorNode): CodeMirrorNode {
    return new CodeMirrorNode(
      node.__code,
      node.__language,
      node.__key
    );
  }

  constructor(
    code: string = '',
    language: string = 'javascript',
    key?: NodeKey
  ) {
    super(key);

    this.__code = code;
    this.__language = language;
  }

  createDOM(): HTMLElement {
    return document.createElement('div');
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedCodeMirrorNode {
    return {
      type: 'codemirror',
      version: 1,
      code: this.__code,
      language: this.__language,
    };
  }

  decorate(): ReactElement {
    return (
      <CodeMirrorEditor
        code={this.__code}
        language={this.__language}
        nodeKey={this.__key}
      />
    );
  }
}

export function $createCodeMirrorNode(
  code: string = '',
  language: string = 'javascript'
): CodeMirrorNode {
  return new CodeMirrorNode(code, language);
}

export function $isCodeMirrorNode(
  node: LexicalNode | null | undefined
): node is CodeMirrorNode {
  return node instanceof CodeMirrorNode;
}