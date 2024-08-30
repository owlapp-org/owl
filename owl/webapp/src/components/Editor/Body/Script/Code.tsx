import { sql } from "@codemirror/lang-sql";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import "@components/Editor/styles.css";
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

interface IContentProps {
  store: UseBoundStore<StoreApi<IEditorTabState>>;
  onExecute: () => void;
}

import { getSelectedLines } from "@components/Editor/lib";
import { IEditorTabState } from "@hooks/editorStore";
import useScriptStore from "@hooks/scriptStore";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { StoreApi, UseBoundStore, useStore } from "zustand";

// Define a custom type that extends ReactCodeMirrorRef
export interface ExtendedReactCodeMirrorRef extends ReactCodeMirrorRef {
  getSelectedLines?: () => string[];
}

const Code = forwardRef<ExtendedReactCodeMirrorRef, IContentProps>(
  function Code({ store, onExecute, ...other }, ref) {
    const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);
    const { file, setContent, save } = useStore(store);
    const { setIsCreateModalOpen: setIsCreateScriptModalOpen } =
      useScriptStore();

    const [oldContent, setOldContent] = useState<string>("");

    const onChange = useCallback(
      debounce((newContent: string) => {
        if (trim(newContent) != trim(file.content)) {
          setContent(newContent);
        }
      }, 200),
      [setContent, file.content]
    );
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
    const shortCutKeymap = [
      {
        key: "Mod-Enter",
        run: () => {
          onExecute();
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
          if (oldContent != (file.content ?? "")) {
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
          extensions={[sql({}), Prec.highest(keymap.of(shortCutKeymap))]}
          onChange={onChange}
          style={{ flex: 1 }}
        />
      </div>
    );
  }
);

export default memo(Code);
