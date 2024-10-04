import { IEditorScriptTabState, IEditorTabState } from "@hooks/editorStore";
import { notify } from "@lib/notify";
import { FileType } from "@ts/enums";
import { IScript } from "@ts/interfaces/interfaces";
import React from "react";
import { StoreApi, UseBoundStore } from "zustand";
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
      return (
        <Script
          store={
            store as UseBoundStore<StoreApi<IEditorScriptTabState<IScript>>>
          }
        />
      );
    case FileType.MacroFile:
      return <MacroFile store={store} />;
    case FileType.DataFile:
      notify.error("Unsupported file type");
      return <></>;
    default:
      return (
        <Script
          store={
            store as UseBoundStore<StoreApi<IEditorScriptTabState<IScript>>>
          }
        />
      );
  }
};

export default File;
