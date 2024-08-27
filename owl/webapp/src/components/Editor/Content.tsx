import { sql } from "@codemirror/lang-sql";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { debounce, trim } from "lodash";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./styles.css";

interface IContentProps {
  store: UseBoundStore<StoreApi<IEditorTabState>>;
  onExecute: (selectedLines: string[]) => void;
}

import CreateScriptModal from "@components/CreateScriptModal";
import { IEditorTabState } from "@hooks/editorStore";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { StoreApi, UseBoundStore, useStore } from "zustand";

// Define a custom type that extends ReactCodeMirrorRef
export interface ExtendedReactCodeMirrorRef extends ReactCodeMirrorRef {
  getSelectedLines?: () => string[];
}

const Code = forwardRef<ExtendedReactCodeMirrorRef, IContentProps>(
  function Content(props, ref) {
    const { onExecute, store, ...other } = props;
    const { file, setContent, save } = useStore(store);
    const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);
    const [isCreateScriptModalOpen, setIsCreateScriptModalOpen] =
      useState(false);
    const [oldContent, setOldContent] = useState<string>("");

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
      debounce((newContent: string) => {
        if (trim(newContent) != trim(file.content)) {
          setContent(newContent);
        }
      }, 200),
      [setContent, file.content]
    );

    const handleExecute = () => {
      const view = codeMirrorRef.current?.view;
      if (view) {
        const selectedLines = getSelectedLines(view);
        onExecute(selectedLines);
      }
    };

    const handleSave = async (name?: string) => {
      if (file.id) {
        if (file.content != oldContent) {
          await save(name);
          setOldContent(file.content || "");
        }
      } else {
        setIsCreateScriptModalOpen(true);
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
      {
        key: "Mod-s",
        run: () => {
          handleSave();
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

    useEffect(() => {
      if (file.id) {
        const debouncedSave = debounce(() => {
          if (oldContent != file.content) {
            save();
            setOldContent(file.content || "");
          }
        }, 500);

        const intervalId = setInterval(() => {
          debouncedSave();
        }, 500);

        return () => {
          clearInterval(intervalId);
        };
      }
    }, [file, save]);

    return (
      <div id="code" style={{ height: "100%" }} {...other}>
        <CodeMirror
          ref={codeMirrorRef}
          className="code-mirror"
          value={file.content || ""}
          height="100%"
          extensions={[sql({}), Prec.highest(keymap.of(customKeymap))]}
          onChange={onChange}
          style={{ flex: 1 }}
        />
        <CreateScriptModal
          open={isCreateScriptModalOpen}
          onClose={() => setIsCreateScriptModalOpen(false)}
          onCreate={handleSave}
        />
      </div>
    );
  }
);

export default memo(Code);