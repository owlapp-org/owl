import { IEditorScriptTabState } from "@hooks/editorStore";
import { IQueryResult } from "@ts/interfaces/database_interface";
import { StoreApi, UseBoundStore } from "zustand";
import ResultSetContainer from "./ResultSet";

interface IPanelProps {
  result?: IQueryResult;
  store: UseBoundStore<StoreApi<IEditorScriptTabState>>;
}

const Panel: React.FC<IPanelProps> = ({ result, store }) => {
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
