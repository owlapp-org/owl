import { IEditorTabState } from "@hooks/editorStore";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
import { StoreApi, UseBoundStore } from "zustand";

interface IScriptProps {
  store: UseBoundStore<StoreApi<IEditorTabState>>;
  onExecute: () => void;
}

const Script: React.FC<IScriptProps> = ({ store, onExecute }) => (
  <PanelGroup direction="vertical">
    <ResizablePanel>
      <div style={{ flex: 1, overflow: "hidden", height: "100%" }}>
        <Code ref={codeRef} store={store} onExecute={handleExecute} />
      </div>
    </ResizablePanel>
    <PanelResizeHandle className="panel-resize-handle" />
    <ResizablePanel maxSize={90} minSize={10}>
      <Panel result={result} store={store} />
    </ResizablePanel>
  </PanelGroup>
);

export default Script;
