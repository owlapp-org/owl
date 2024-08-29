import CreateDatabaseModal from "@components/Database/CreateDatabaseModal";
import UpdateDatabaseModal from "@components/Database/UpdateDatabaseModal";
import DatabaseMenu from "@components/DatabaseMenu";
import TreeNode from "@components/TreeNode";
import useDatabaseStore from "@hooks/databaseStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { IconBrandOnedrive, IconCylinder, IconPlus } from "@tabler/icons-react";
import { IDatabase } from "@ts/interfaces/database_interface";
import { useEffect, useState } from "react";
import "./styles.css";

function databaseToTreeNodeData(
  database: IDatabase,
  onDelete: (id: number) => void,
  onUpdate: (database: IDatabase) => void
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
      actions: (
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
  const { databases, fetchAll, update, remove } = useDatabaseStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<IDatabase | null>(
    null
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdateDatabase = (database: IDatabase) => {
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
        actions: (
          <ActionIcon
            className="root-node-action-icon"
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
        databaseToTreeNodeData(db, remove, handleUpdateDatabase)
      ),
    },
  ];

  return (
    <>
      <Tree
        className="nav-tree"
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
