import {
  DecoratorNode,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { CodeMirrorEditor } from "../../code-mirror";
import { JSX } from "react/jsx-runtime";

export type SerializedCodeMirrorNode = Spread<
  {
    code: string;
    language: string;
  },
  SerializedLexicalNode
>;

export class CodeMirrorNode extends DecoratorNode<JSX.Element> {
  __code: string;
  __language: string;

  static getType() {
    return "codemirror";
  }

  static clone(node: CodeMirrorNode) {
    return new CodeMirrorNode(
      node.__code,
      node.__language,
      node.__key,
    );
  }

  static importJSON(
    serializedNode: SerializedCodeMirrorNode,
  ): CodeMirrorNode {
    return $createCodeMirrorNode(
      serializedNode.code,
      serializedNode.language,
    );
  }

  constructor(
    code = "",
    language = "javascript",
    key?: NodeKey,
  ) {
    super(key);

    this.__code = code;
    this.__language = language;
  }

  getCode(): string {
    return this.getLatest().__code;
  }

  getLanguage(): string {
    return this.getLatest().__language;
  }

  setCode(code: string): void {
    const writable = this.getWritable();
    writable.__code = code;
  }

  setLanguage(language: string): void {
    const writable = this.getWritable();
    writable.__language = language;
  }

  exportJSON(): SerializedCodeMirrorNode {
    return {
      ...super.exportJSON(),
      type: "codemirror",
      version: 1,
      code: this.getCode(),
      language: this.getLanguage(),
    };
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <CodeMirrorEditor
        nodeKey={this.__key}
      />
    );
  }
}

export function $createCodeMirrorNode(
  code = "",
  language = "javascript",
) {
  return new CodeMirrorNode(code, language);
}

export function $isCodeMirrorNode(
  node: LexicalNode | null | undefined,
): node is CodeMirrorNode {
  return node instanceof CodeMirrorNode;
}