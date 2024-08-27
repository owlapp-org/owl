import DatabasesNode from "./DatabasesNode";
import DataFilesNode from "./DataFilesNode";
import ScriptsNode from "./ScriptsNode";
import "./styles.css";

export default function NavExplorer() {
  return (
    <div
      className="nav-explorer"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <DatabasesNode />
      <DataFilesNode />
      <ScriptsNode />
    </div>
  );
}
