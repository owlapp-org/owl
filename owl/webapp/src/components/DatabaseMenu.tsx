// src/components/DatabaseMenu.tsx
import { useAlertDialog } from "@contexts/AlertDialogContext";
import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { Database } from "@ts/interfaces/database_interface";

interface DatabaseMenuProps {
  database: Database;
  onDelete: (id: number) => void;
  onUpdate: (database: Database) => void;
  className?: string;
}

export default function DatabaseMenu({
  database,
  onDelete,
  onUpdate,
  className,
}: DatabaseMenuProps) {
  const { showDialog } = useAlertDialog();

  const handleDelete = () => {
    showDialog({
      title: "Confirm Delete",
      body: `Are you sure you want to delete the database ${database.name}?`,
      okButtonLabel: "Delete",
      cancelButtonLabel: "Cancel",
      onOk: () => onDelete(database.id),
    });
  };

  const handleUpdate = () => {
    onUpdate(database);
  };

  return (
    <Menu withinPortal position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon className={className} variant="transparent">
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={200}>
        <Menu.Item onClick={handleUpdate}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <IconEdit size={16} stroke={1} />
            </div>
            <div>Edit</div>
          </div>
        </Menu.Item>
        <Menu.Item
          color="red"
          onClick={handleDelete}
          style={{ display: "flex", alignItems: "center" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <IconTrash size={16} stroke={1} />
            </div>
            <div>Delete</div>
          </div>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
