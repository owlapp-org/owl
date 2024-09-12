import "@components/Editor/styles.css";
import { IEditorScriptTabState } from "@hooks/editorStore";
import { IconBorderAll } from "@tabler/icons-react";
import { IQueryResult } from "@ts/interfaces/database_interface";
import { useEffect, useRef, useState } from "react";
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
  store: UseBoundStore<StoreApi<IEditorScriptTabState>>;
}

const Script: React.FC<IScriptProps> = ({ store }) => {
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);
  const { content, runQuery } = useStore(store, (state) => ({
    content: state.content,
    runQuery: state.runQuery,
  }));
  const [queryResult, setQueryResult] = useState<IQueryResult | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    let query = content || "";
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
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("Script.index");
  });

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
          {!queryResult && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div>
                <IconBorderAll
                  size={48}
                  stroke={1}
                  color="var(--mantine-color-gray-2)"
                />
              </div>
              <div style={{ color: "var(--mantine-color-gray-4)" }}>
                Results will be shown here
              </div>
            </div>
          )}
        </ResizablePanel>
      </PanelGroup>
    </div>
  );
};

export default Script;
