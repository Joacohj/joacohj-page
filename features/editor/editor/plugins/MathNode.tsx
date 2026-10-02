import {
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";

import katex from "katex";
import "katex/dist/katex.min.css";
import { JSX } from "react/jsx-runtime";

export type SerializedMathNode = Spread<
  {
    type: "math";
    version: 1;
    latex: string;
    display: boolean;
  },
  SerializedLexicalNode
>;

export class MathNode extends DecoratorNode<JSX.Element> {
  __latex: string;
  __display: boolean;

  static getType(): string {
    return "math";
  }

  static clone(node: MathNode): MathNode {
    return new MathNode(
      node.__latex,
      node.__display,
      node.__key,
    );
  }

  constructor(
    latex: string,
    display = false,
    key?: NodeKey,
  ) {
    super(key);

    this.__latex = latex;
    this.__display = display;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement(
      this.__display ? "div" : "span",
    );

    element.className = this.__display
      ? "lexical-math lexical-math-block"
      : "lexical-math lexical-math-inline";

    return element;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <MathComponent
        latex={this.__latex}
        display={this.__display}
      />
    );
  }

  exportJSON(): SerializedMathNode {
    return {
      type: "math",
      version: 1,
      latex: this.__latex,
      display: this.__display,
    };
  }

  static importJSON(
    serializedNode: SerializedMathNode,
  ): MathNode {
    return new MathNode(
      serializedNode.latex,
      serializedNode.display,
    );
  }

  getLatex(): string {
    return this.getLatest().__latex;
  }

  getDisplay(): boolean {
    return this.getLatest().__display;
  }

  setLatex(latex: string): void {
    const writable = this.getWritable();

    writable.__latex = latex;
  }

  setDisplay(display: boolean): void {
    const writable = this.getWritable();

    writable.__display = display;
  }

  isInline(): boolean {
    return !this.getLatest().__display;
  }

  isBlock(): boolean {
    return this.getLatest().__display;
  }
}

function MathComponent({
  latex,
  display,
}: {
  latex: string;
  display: boolean;
}) {
  let html = "";

  try {
    html = katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
    });
  } catch {
    html = katex.renderToString(
      `\\text{Invalid LaTeX}`,
      {
        displayMode: display,
        throwOnError: false,
      },
    );
  }

  return (
    <span
      className={
        display
          ? "lexical-math-rendered lexical-math-rendered-block"
          : "lexical-math-rendered lexical-math-rendered-inline"
      }
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}

export function $createMathNode(
  latex: string,
  display = false,
): MathNode {
  return new MathNode(latex, display);
}

export function $isMathNode(
  node: LexicalNode | null | undefined,
): node is MathNode {
  return node instanceof MathNode;
}