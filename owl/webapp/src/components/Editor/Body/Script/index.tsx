import "@components/Editor/styles.css";
import { IEditorTabState } from "@hooks/editorStore";
import { IQueryResult } from "@ts/interfaces/database_interface";
import { useRef, useState } from "react";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import Code, { ExtendedReactCodeMirrorRef } from "./Code";
import Panel from "./Panel";
import ScriptToolbar from "./ScriptToolbar";

interface IScriptProps {
  store: UseBoundStore<StoreApi<IEditorTabState>>;
}

const Script: React.FC<IScriptProps> = ({ store }) => {
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);
  const { file, runQuery } = useStore(store);
  const [queryResult, setQueryResult] = useState<IQueryResult | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    let query = file.content || "";
    if (codeRef.current) {
      const selected = (codeRef.current?.getSelectedLines?.() ?? []).join("\n");
      if (selected) {
        query = selected;
      }
    }
    query = query.trim();
    if (!query) {
      return;
    }
    setIsLoading(true);
    const result = await runQuery(query, 0, 25); // todo hardcoded values
    setQueryResult(result);
    console.log(result);
    console.log(queryResult);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <ScriptToolbar
        store={store}
        onExecute={handleExecute}
        isLoading={isLoading}
      />
      <PanelGroup direction="vertical">
        <ResizablePanel defaultSize={60}>
          <div style={{ flex: 1, overflow: "hidden", height: "100%" }}>
            <Code ref={codeRef} store={store} onExecute={handleExecute} />
          </div>
        </ResizablePanel>
        <PanelResizeHandle className="panel-resize-handle" />
        <ResizablePanel maxSize={90} minSize={10}>
          {queryResult && <Panel result={queryResult} store={store} />}
        </ResizablePanel>
      </PanelGroup>
    </div>
  );
};

export default Script;
