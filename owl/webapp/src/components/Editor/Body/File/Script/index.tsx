import "@components/Editor/styles.css";
import { IEditorScriptTabState } from "@hooks/editorStore";
import { CodeHighlight } from "@mantine/code-highlight";
import { notifications } from "@mantine/notifications";
import MacroFileService from "@services/macrofileService";
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
  const [isRunLoading, setIsRunLoading] = useState(false);
  const [isRenderLoading, setIsRenderLoading] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");
  const [activePanel, setActivePanel] = useState(0);

  const handleRenderClick = async () => {
    setIsRenderLoading(true);
    try {
      const result: any = await MacroFileService.renderContent(content);
      setRenderedContent(result["content"]);
      setActivePanel(2);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to render. ${err}`,
      });
    } finally {
      setIsRenderLoading(false);
    }
  };

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
    setIsRunLoading(true);
    const result = await runQuery(query, 0, 25); // todo hardcoded values
    setQueryResult(result);
    setActivePanel(1);
    setIsRunLoading(false);
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
        onRender={handleRenderClick}
        isRunLoading={isRunLoading}
        isRenderLoading={isRenderLoading}
      />
      <PanelGroup direction="vertical">
        <ResizablePanel defaultSize={60}>
          <div style={{ flex: 1, overflow: "hidden", height: "100%" }}>
            <Code ref={codeRef} store={store} onExecute={handleExecute} />
          </div>
        </ResizablePanel>
        <PanelResizeHandle className="panel-resize-handle" />
        <ResizablePanel maxSize={90} minSize={10}>
          {queryResult && activePanel == 1 && (
            <Panel result={queryResult} store={store} />
          )}
          {activePanel == 2 && (
            <CodeHighlight
              className="app-code-highlight macro-code-highlight"
              styles={{
                root: {
                  marginTop: "0px !important;",
                  paddingTop: "0px",
                },
              }}
              style={{
                marginTop: "0px !important;",
                padding: "0px",
                width: "100%",
                height: "100%",
                flexGrow: "1",
              }}
              code={renderedContent}
              language="sql"
              mt="md"
            />
          )}
          {!queryResult && activePanel == 0 && (
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
