import { sql } from "@codemirror/lang-sql";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import "@components/Editor/styles.css";
import CodeMirror from "@uiw/react-codemirror";
import { debounce } from "lodash";
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

interface IContentProps {
  store: UseBoundStore<StoreApi<IEditorTabState<IScript>>>;
  onRender: () => void;
  onExecute: () => void;
}

import { getSelectedLines, getSelection } from "@components/Editor/lib";
import { useCreateFileModalStore } from "@components/modals/CreateFileModal/useCreateFileModalStore";
import { IEditorTabState } from "@hooks/editorStore";
import { FileType } from "@ts/enums";
import { IScript } from "@ts/interfaces/interfaces";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

// Define a custom type that extends ReactCodeMirrorRef
export interface ExtendedReactCodeMirrorRef extends ReactCodeMirrorRef {
  getSelectedLines?: () => string[];
  getSelection?: () => string;
}

const ScriptCode = forwardRef<ExtendedReactCodeMirrorRef, IContentProps>(
  function Code({ store, onExecute, onRender, ...other }, ref) {
    const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);
    const { fileId, content, setContent, save } = useStore(
      store,
      useShallow((state) => ({
        fileId: state.file.id,
        content: state.content,
        setContent: state.setContent,
        save: state.save,
      }))
    );
    const { showModal: showCreateFileModal } = useCreateFileModalStore();

    const onChange = useMemo(
      () =>
        debounce((newContent: string) => {
          setContent(newContent);
          fileId && save();
        }, 200),
      [setContent]
    );

    const handleSave = useCallback(
      async (name?: string) => {
        if (fileId) {
          await save(name);
        } else {
          showCreateFileModal({
            fileType: FileType.ScriptFile,
            onSave: save,
          });
        }
      },
      [fileId]
    );
    const shortCutKeymap = useMemo(
      () => [
        {
          key: "Mod-Enter",
          run: () => {
            onExecute();
            return true;
          },
        },
        {
          key: "Mod-\\",
          run: () => {
            onRender();
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
      ],
      [onExecute, handleSave]
    );
    useImperativeHandle(ref, () => ({
      getSelectedLines: () => {
        const view = codeMirrorRef.current?.view;
        if (view) {
          return getSelectedLines(view);
        }
        return [];
      },
      getSelection: () => {
        const view = codeMirrorRef.current?.view;
        if (view) {
          return getSelection(view);
        }
        return "";
      },
    }));
    return (
      <div id="code" style={{ height: "100%" }} {...other}>
        <CodeMirror
          ref={codeMirrorRef}
          className="code-mirror"
          value={content}
          height="100%"
          extensions={[sql({}), Prec.highest(keymap.of(shortCutKeymap))]}
          onChange={onChange}
          style={{ flex: 1 }}
        />
      </div>
    );
  }
);

export default memo(ScriptCode);
