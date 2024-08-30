import CreateDatabaseModal from "@components/modals/CreateDatabaseModal";
import CreateScriptModal from "@components/modals/CreateScriptModal/CreateScriptModal";
import RenameFileModal from "@components/modals/RenameFileModal/RenameFileModal";
import useDatabaseStore from "@hooks/databaseStore";
import DatabasesNode from "./DatabasesNode";
import DataFilesNode from "./DataFilesNode";
import ScriptsNode from "./ScriptsNode";
import "./styles.css";

export default function NavExplorer() {
  const {
    isCreateModalOpen: isCreateDatabaseModalOpen,
    setIsCreateModalOpen: setIsCreateDatabaseModalOpen,
  } = useDatabaseStore();

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
      {/* -- modals -- */}
      <CreateDatabaseModal
        open={isCreateDatabaseModalOpen}
        onClose={() => setIsCreateDatabaseModalOpen(false)}
      />
      <RenameFileModal />
      <CreateScriptModal />
    </div>
  );
}
