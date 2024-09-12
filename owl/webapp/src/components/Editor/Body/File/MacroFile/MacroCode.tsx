import { StreamLanguage } from "@codemirror/language";
import { jinja2 } from "@codemirror/legacy-modes/mode/jinja2";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import "@components/Editor/styles.css";
import CodeMirror from "@uiw/react-codemirror";
import { debounce } from "lodash";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

interface IMacroCodeProps {
  store: UseBoundStore<StoreApi<IEditorScriptTabState>>;
}

import { IEditorScriptTabState } from "@hooks/editorStore";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

const MacroCode: React.FC<IMacroCodeProps> = ({ store, ...other }) => {
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

  const onChange = useMemo(
    () =>
      debounce((newContent: string) => {
        setContent(newContent);
      }, 200),
    [setContent]
  );
  const handleSave = useCallback(
    async (name?: string) => {
      if (fileId) {
        await save(name);
      } else {
        // setIsCreateScriptModalOpen(true);
      }
    },
    [fileId]
  );
  const shortCutKeymap = useMemo(
    () => [
      {
        key: "Mod-s",
        run: () => {
          handleSave();
          return true;
        },
      },
    ],
    [handleSave]
  );
  useEffect(() => {
    if (fileId) {
      const debouncedSave = debounce(() => {
        save();
      }, 500);

      const intervalId = setInterval(() => {
        debouncedSave();
      }, 500);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [fileId, save]);

  return (
    <div id="code" style={{ height: "100%" }} {...other}>
      <CodeMirror
        ref={codeMirrorRef}
        className="code-mirror"
        value={content}
        height="100%"
        extensions={[
          StreamLanguage.define(jinja2),
          Prec.highest(keymap.of(shortCutKeymap)),
        ]}
        onChange={onChange}
        style={{ flex: 1 }}
      />
    </div>
  );
};

export default memo(MacroCode);
