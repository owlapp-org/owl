import { IEditorTabStore } from "@hooks/editorStore";
import { QueryResult } from "@ts/interfaces/database_interface";
import { StoreApi, UseBoundStore } from "zustand";
import ResultSetContainer from "./ResultSet";

const Panel = ({
  result,
  store,
}: {
  result?: QueryResult;
  store: UseBoundStore<StoreApi<IEditorTabStore>>;
}) => {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <ResultSetContainer result={result} store={store} />
    </div>
  );
};

export default Panel;
