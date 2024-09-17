import { IEditorTabState } from "@hooks/editorStore";
import { notify } from "@lib/notify";
import { FileType } from "@ts/enums/filetype_enum";
import React from "react";
import { StoreApi, UseBoundStore } from "zustand";
import DashboardFile from "./DashboardFile";
import MacroFile from "./MacroFile";
import Script from "./Script";
import "./styles.css";

const File = <T,>({
  fileType,
  store,
}: {
  fileType?: FileType;
  store: UseBoundStore<StoreApi<IEditorTabState<T>>>;
}): React.ReactElement => {
  switch (fileType) {
    case FileType.ScriptFile:
      return <Script store={store} />;
    case FileType.MacroFile:
      return <MacroFile store={store} />;
    case FileType.DashboardFile:
      return <DashboardFile store={store} />;
    case FileType.DataFile:
      notify.error("Unsupported file type");
      return <></>;
    default:
      return <Script store={store} />;
  }
};

export default File;
