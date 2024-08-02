import CreateDatabaseModal from "@components/Database/CreateDatabaseModal";
import UpdateDatabaseModal from "@components/Database/UpdateDatabaseModal";
import DatabaseMenu from "@components/DatabaseMenu";
import TreeNode from "@components/TreeNode";
import { useDatabaseStore } from "@hooks/useDatabaseStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { IconBrandOnedrive, IconCylinder, IconPlus } from "@tabler/icons-react";
import { Database } from "@ts/interfaces/database_interface";
import { useEffect, useState } from "react";
import "./styles.css";

function databaseToTreeNodeData(
  database: Database,
  onDelete: (id: number) => void,
  onUpdate: (database: Database) => void
): TreeNodeData {
  return {
    label: database.name,
    value: `${database.id}`,
    nodeProps: {
      icon: (
        <div>
          <IconCylinder
            stroke={1}
            size={18}
            color="var(--mantine-color-gray-8)"
          />
        </div>
      ),
      action: (
        <DatabaseMenu
          database={database}
          onDelete={onDelete}
          onUpdate={onUpdate}
          className="menu-icon"
        />
      ),
    },
  };
}

export default function DatabasesNode() {
  const { databases, fetchDatabases, updateDatabase, removeDatabase } =
    useDatabaseStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(
    null
  );

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleUpdateDatabase = (database: Database) => {
    setSelectedDatabase(database);
    setIsUpdateModalOpen(true);
  };

  const data: TreeNodeData[] = [
    {
      label: "Databases",
      value: "databases",
      nodeProps: {
        icon: (
          <div>
            <IconBrandOnedrive stroke={1} color="var(--mantine-color-blue-8)" />
          </div>
        ),
        action: (
          <ActionIcon
            variant="transparent"
            onClick={(event) => {
              event.stopPropagation();
              setIsCreateModalOpen(true);
            }}
          >
            <IconPlus stroke={1} />
          </ActionIcon>
        ),
      },
      children: databases.map((db) =>
        databaseToTreeNodeData(db, removeDatabase, handleUpdateDatabase)
      ),
    },
  ];

  return (
    <>
      <Tree
        selectOnClick
        clearSelectionOnOutsideClick
        data={data}
        renderNode={(payload) => <TreeNode {...payload} />}
      />
      <CreateDatabaseModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <UpdateDatabaseModal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        database={selectedDatabase}
      />
    </>
  );
}
