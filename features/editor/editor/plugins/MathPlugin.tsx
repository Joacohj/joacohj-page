"use client";

import {
  $getNodeByKey,
  COMMAND_PRIORITY_LOW,
  CLICK_COMMAND,
  type LexicalEditor,
} from "lexical";

import {
  $createMathNode,
  $isMathNode,
} from "./MathNode";

import {
  useEffect,
  useState,
} from "react";

type MathPluginProps = {
  editor: LexicalEditor;
};

export function MathPlugin({
  editor,
}: MathPluginProps) {
  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;

        if (!target) {
          return false;
        }

        const mathElement =
          target.closest<HTMLElement>(
            "[data-math-node]",
          );

        if (!mathElement) {
          return false;
        }

        const nodeKey =
          mathElement.dataset.mathNode;

        if (!nodeKey) {
          return false;
        }

        editor.update(() => {
          const node =
            $getNodeByKey(nodeKey);

          if (!$isMathNode(node)) {
            return;
          }

          node.setLatex(node.getLatex());
        });

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}