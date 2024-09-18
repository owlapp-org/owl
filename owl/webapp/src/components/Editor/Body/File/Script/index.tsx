import "@components/Editor/styles.css";
import { IEditorTabState } from "@hooks/editorStore";
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
import Panel from "./ScriptPanel";
import ScriptToolbar from "./ScriptToolbar";

interface IScriptProps {
  store: UseBoundStore<StoreApi<IEditorTabState<IScript>>>;
}

const Script: React.FC<IScriptProps> = ({ store }) => {
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);
  const { content, databaseId } = useStore(store, (state) => ({
    content: state.content,
    databaseId: state.getOption("databaseId"),
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

  const handleRenderClick = async () => {
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
    // todo hardcoded values
    const result = await databaseService.run(databaseId, query, 0, 25);
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
          <Panel
            renderedContent={renderedContent}
            result={queryResult}
            store={store}
            active={activePanel}
          />
        </ResizablePanel>
      </PanelGroup>
    </div>
  );
};

export default Script;
