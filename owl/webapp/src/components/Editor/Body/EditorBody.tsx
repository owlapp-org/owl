import { IEditorTabState } from "@hooks/editorStore";
import React, { useEffect, useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import ContentLoading from "./ContentLoading";
import File from "./File";

interface IEditorBodyProps<T> {
  store: UseBoundStore<StoreApi<IEditorTabState<T>>>;
}

const EditorBody = <T,>({ store }: IEditorBodyProps<T>): React.ReactElement => {
  const [isContentLoading, setIsContentLoading] = useState(false);
  const { fileId, fileType, fetchAndSetContent } = useStore(
    store,
    useShallow((state) => ({
      fileId: state.file.id,
      fileType: state.file.fileType,
      fetchAndSetContent: state.fetchAndSetContent,
    }))
  );

  useEffect(() => {
    if (fileId) {
      setIsContentLoading(true);
      fetchAndSetContent().finally(() => setIsContentLoading(false));
    }
  }, [fileId]);

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
        {isContentLoading ? (
          <ContentLoading />
        ) : (
          <File fileType={fileType} store={store} />
        )}
      </div>
    </div>
  );
};

export default EditorBody;
