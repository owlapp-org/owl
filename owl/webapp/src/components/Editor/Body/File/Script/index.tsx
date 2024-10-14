import "@components/Editor/styles.css";
import ExportDataModal from "@components/modals/ExportDataModal/ExportDataModal";
import { IEditorScriptTabState } from "@hooks/editorStore";
import { notify } from "@lib/notify";
import { databaseService, macroFileService } from "@services/services";
import { IQueryResult, IScript } from "@ts/interfaces/interfaces";
import { useEffect, useRef, useState } from "react";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import Code, { ExtendedReactCodeMirrorRef } from "./ScriptCode";
import ScriptPanel from "./ScriptPanel";
import ScriptToolbar from "./ScriptToolbar";

interface IScriptProps {
  store: UseBoundStore<StoreApi<IEditorScriptTabState<IScript>>>;
}

const Script: React.FC<IScriptProps> = ({ store }) => {
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);
  const { content, getOption, setLastExecution } = useStore(store, (state) => ({
    content: state.content,
    getOption: state.getOption,
    setLastExecution: state.setLastExecution,
  }));

  const [queryResult, setQueryResult] = useState<IQueryResult | undefined>(
    undefined
  );
  const [isRunLoading, setIsRunLoading] = useState(false);
  const [isRenderLoading, setIsRenderLoading] = useState(false);
  const [renderedContent, setRenderedContent] = useState("");
  const [activePanel, setActivePanel] = useState(0);

  const selectionOrContent = (): string => {
    let text = content || "";
    if (codeRef.current) {
      const selection = codeRef.current?.getSelection?.() ?? "";
      if (selection) {
        text = selection;
      }
    }
    return text.trim();
  };

  const handleRender = async () => {
    try {
      setIsRenderLoading(true);
      const text = selectionOrContent();
      const result: any = await macroFileService.renderContent(text);
      setRenderedContent(result["content"]);
      setActivePanel(2);
    } catch (err) {
      notify.error(`Failed to render. ${err}`);
    } finally {
      setIsRenderLoading(false);
    }
  };

  const handleExecute = async () => {
    const query = selectionOrContent();
    if (!query) return;
    setIsRunLoading(true);
    try {
      const databaseId = getOption("databaseId") as number;
      // todo hardcoded values
      const result = await databaseService.run(databaseId, query, 0, 25);
      setQueryResult(result);
      setLastExecution({
        databaseId,
        query,
        statement_type: result.statement_type,
      });
      setActivePanel(1);
    } catch (err: any) {
      notify.error(err["response"]["data"]["message"] || `${err}`);
    } finally {
      setIsRunLoading(false);
    }
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
        onRender={handleRender}
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
          <ScriptPanel
            renderedContent={renderedContent}
            result={queryResult}
            active={activePanel}
            setActivePanel={setActivePanel}
          />
        </ResizablePanel>
      </PanelGroup>
      <ExportDataModal />
    </div>
  );
};

export default Script;
