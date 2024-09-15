import CreateDatabaseModal from "@components/modals/CreateDatabaseModal/CreateDatabaseModal";
import CreateScriptModal from "@components/modals/CreateFileModal/CreateFileModal";
import RenameFileModal from "@components/modals/RenameFileModal/RenameFileModal";
import UpdateDatabaseModal from "@components/modals/UpdateDatabaseModal/UpdateDatabaseModal";
import DashboardsNode from "./DashboardsNode";
import DatabasesNode from "./DatabasesNode";
import DataFilesNode from "./DataFilesNode";
import MacrosNode from "./MacrosNode";
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
      <MacrosNode />
      <DashboardsNode />
      {/* -- modals -- */}
      <CreateDatabaseModal />
      <UpdateDatabaseModal />
      <RenameFileModal />
      <CreateScriptModal />
    </div>
  );
}
