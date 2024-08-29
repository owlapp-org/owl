import { IEditorTabState } from "@hooks/editorStore";
import { StoreApi, UseBoundStore } from "zustand";
import Script from "./Script";

interface IEditorBodyProps {
  store: UseBoundStore<StoreApi<IEditorTabState>>;
}

const EditorBody: React.FC<IEditorBodyProps> = ({ store }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 84px)",
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid #E9ECEF",
      }}
    >
      <div
        style={{
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Script store={store} />
      </div>
    </div>
  );
};

export default EditorBody;
