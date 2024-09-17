import DatabaseMenu from "@components/DatabaseMenu";
import { useCreateDatabaseModalStore } from "@components/modals/CreateDatabaseModal/useCreateDatabaseModalStore";
import { useUpdateDatabaseModalStore } from "@components/modals/UpdateDatabaseModal/useUpdateDatabaseModalStore";
import TreeNode from "@components/TreeNode";
import { useDatabaseStore } from "@hooks/hooks";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { IconBrandOnedrive, IconCylinder, IconPlus } from "@tabler/icons-react";
import { IDatabase } from "@ts/interfaces/interfaces";
import { useEffect } from "react";
import "./styles.css";

function toNode(
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
  const { items, fetchAll, remove } = useDatabaseStore();
  const { showModal: showCreateDatabaseModal } = useCreateDatabaseModalStore();
  const { showModal: showUpdateDatabaseModal } = useUpdateDatabaseModalStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUpdateDatabase = (database: IDatabase) => {
    showUpdateDatabaseModal({ databaseId: database.id });
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
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
            }}
          >
            <ActionIcon
              className="root-node-action-icon"
              variant="transparent"
              onClick={(event) => {
                event.stopPropagation();
                showCreateDatabaseModal({});
              }}
            >
              <IconPlus stroke={1} />
            </ActionIcon>
          </div>
        ),
      },
      children: items.map((db) => toNode(db, remove, handleUpdateDatabase)),
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
    </>
  );
}
