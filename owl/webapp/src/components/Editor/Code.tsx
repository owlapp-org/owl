import { sql } from "@codemirror/lang-sql";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import useEditorStore from "@hooks/editorStore";
import CodeMirror from "@uiw/react-codemirror";
import { debounce, trim } from "lodash";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import "./styles.css";

interface CodeProps {
  onExecute: (selectedLines: string[]) => void;
}

import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

// Define a custom type that extends ReactCodeMirrorRef
export interface ExtendedReactCodeMirrorRef extends ReactCodeMirrorRef {
  getSelectedLines?: () => string[];
}

const Code = forwardRef<ExtendedReactCodeMirrorRef, CodeProps>(function Code(
  props,
  ref
) {
  const { onExecute, ...other } = props;
  const { code, setCode } = useEditorStore();

  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  const getSelectedLines = (view: EditorView): string[] => {
    const state = view.state;
    const selection = state.selection.main;
    const doc = state.doc;

    const startLine = doc.lineAt(selection.from).number;
    const endLine = doc.lineAt(selection.to).number;

    // If no text is selected (cursor is on a single line), return an empty array
    if (selection.from === selection.to) {
      return [];
    }

    let selectedLines = [];
    for (let i = startLine; i <= endLine; i++) {
      selectedLines.push(doc.line(i).text);
    }

    return selectedLines;
  };

  const onChange = useCallback(
    debounce((newCode: string) => {
      if (trim(newCode) != trim(code)) {
        setCode(newCode);
      }
    }, 200),
    [setCode]
  );

  const handleExecute = () => {
    const view = codeMirrorRef.current?.view;
    if (view) {
      const selectedLines = getSelectedLines(view);
      console.log("Selected Lines:", selectedLines); // Log selected lines or use as needed
      onExecute(selectedLines);
    }
  };

  const customKeymap = [
    {
      key: "Mod-Enter",
      run: () => {
        handleExecute();
        return true;
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    getSelectedLines: () => {
      const view = codeMirrorRef.current?.view;
      if (view) {
        return getSelectedLines(view);
      }
      return [];
    },
  }));

  return (
    <div id="code" style={{ height: "100%" }} {...other}>
      <CodeMirror
        ref={codeMirrorRef}
        className="code-mirror"
        value={code}
        height="100%"
        extensions={[sql({}), Prec.highest(keymap.of(customKeymap))]}
        onChange={onChange}
        style={{ flex: 1 }}
      />
    </div>
  );
});

export default memo(Code);
