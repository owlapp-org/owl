import { IEditorScriptTabState } from "@hooks/editorStore";
import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import React from "react";
import { StoreApi, UseBoundStore } from "zustand";
import MacroFile from "./MacroFile";
import Script from "./Script";
import "./styles.css";

const File: React.FC<{
  fileType?: FileType;
  store: UseBoundStore<StoreApi<IEditorScriptTabState | IEditorScriptTabState>>;
}> = React.memo(({ fileType, store }) => {
  switch (fileType) {
    case FileType.ScriptFile:
      return <Script store={store} />;
    case FileType.MacroFile:
      return <MacroFile store={store} />;
    case FileType.DataFile:
      notifications.show({
        color: "red",
        title: "Error",
        message: "Unsupported file type",
      });
      return null;
    default:
      return <Script store={store} />;
  }
});

export default File;
