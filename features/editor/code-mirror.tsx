"use client";

import { useEffect, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { $getNodeByKey, NodeKey } from "lexical";
import { useTheme } from "next-themes";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $isCodeMirrorNode } from "./editor/plugins/code-mirror-node";

type Props = {
  nodeKey: NodeKey;
};

export function CodeMirrorEditor({ nodeKey }: Props) {
  const [editor] = useLexicalComposerContext();
  const { theme } = useTheme();

  const [code, setCode] = useState("");

  useEffect(() => {
    const readCode = () => {
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(nodeKey);


        if ($isCodeMirrorNode(node)) {
          const value = node.getCode();


          setCode(value);
        }
      });
    };

    // Estado inicial
    readCode();

    // Cambios posteriores
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const node = $getNodeByKey(nodeKey);

        if ($isCodeMirrorNode(node)) {
          const value = node.getCode();

          setCode(value);
        }
      });
    });
  }, [editor, nodeKey]);

  const handleChange = (value: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if ($isCodeMirrorNode(node)) {
        node.setCode(value);
      }
    });
  };

  return (
    <CodeMirror
      value={code}
      onChange={handleChange}
      editable={editor.isEditable()}
      className="w-full min-w-0 max-w-full overflow-hidden rounded-xl"
      width="auto"
      extensions={[
        javascript({
          jsx: true,
          typescript: true,
        }),
      ]}
      theme={theme === "light" ? "light" : "dark"}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        autocompletion: true,
      }}
    />
  );
}