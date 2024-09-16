// src/components/DatabaseMenu.tsx
import { useAlertDialog } from "@contexts/AlertDialogContext";
import { ActionIcon, Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { IDatabase } from "@ts/interfaces/database_interface";

interface IDatabaseMenuProps {
  database: IDatabase;
  className?: string;
  onDelete: (id: number) => void;
  onUpdate: (database: IDatabase) => void;
}

export default function DatabaseMenu({
  database,
  className,
  onDelete,
  onUpdate,
}: IDatabaseMenuProps) {
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
  const handleDownload = async () => {
    const { id, name } = database;
    try {
      await DatabaseService.download(id, name);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: `Error downloading database. ${error}`,
      });
    }
  };

  return (
    <Menu withinPortal position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon className={className} variant="transparent">
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={200}>
        <Menu.Item onClick={() => onUpdate(database)}>
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
        <Menu.Item onClick={handleDownload}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <IconDownload size={16} stroke={1} />
            </div>
            <div>Download</div>
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
