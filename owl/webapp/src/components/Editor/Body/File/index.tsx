import { IEditorTabState } from "@hooks/editorStore";
import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import React from "react";
import { StoreApi, UseBoundStore } from "zustand";
import Script from "./Script";

const File: React.FC<{
  fileType?: FileType;
  store: UseBoundStore<StoreApi<IEditorTabState>>;
}> = React.memo(({ fileType, store }) => {
  switch (fileType) {
    case FileType.ScriptFile:
      return <Script store={store} />;
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
