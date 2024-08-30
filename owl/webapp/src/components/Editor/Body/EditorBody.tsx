import { IEditorTabState } from "@hooks/editorStore";
import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import { useEffect, useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import ContentLoading from "./ContentLoading";
import Script from "./Script";

interface IEditorBodyProps {
  store: UseBoundStore<StoreApi<IEditorTabState>>;
}

const EditorBody: React.FC<IEditorBodyProps> = ({ store }) => {
  const [isContentLoading, setIsContentLoading] = useState(false);
  const { file, fetchContent } = useStore(store, (state) => ({
    file: state.file,
    fetchContent: state.fetchContent,
  }));

  useEffect(() => {
    if (file.id) {
      setIsContentLoading(true);
      fetchContent().finally(() => setIsContentLoading(false));
    }
  }, [file.id]);

  const File = () => {
    switch (file.fileType) {
      case FileType.ScriptFile:
        return <Script store={store} />;
      case FileType.DataFile:
        notifications.show({
          color: "red",
          title: "Error",
          message: "Unsupported file type",
        });
        return;
      default:
        return <Script store={store} />;
    }
  };

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
        {isContentLoading ? <ContentLoading /> : <File />}
      </div>
    </div>
  );
};

export default EditorBody;
