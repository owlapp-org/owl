// src/components/DatabaseMenu.tsx
import { useAlertDialog } from "@contexts/AlertDialogContext";
import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { IFile } from "@ts/interfaces/file_interface";

interface FileMenuProps {
  file: IFile;
  onDelete: (id: number) => void;
  onRename: (file: IFile) => void;
  className?: string;
}

export default function FileMenu({
  file,
  onDelete,
  onRename,
  className,
}: FileMenuProps) {
  const { showDialog } = useAlertDialog();

  const handleDelete = () => {
    showDialog({
      title: "Confirm Delete",
      body: `Are you sure you want to delete the file ${file.name}?`,
      okButtonLabel: "Delete",
      cancelButtonLabel: "Cancel",
      onOk: () => onDelete(file.id),
    });
  };

  const handleRename = () => {
    onRename(file);
  };

  return (
    <Menu withinPortal position="bottom-end" withArrow>
      <Menu.Target>
        <ActionIcon className={className} variant="transparent">
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown miw={200}>
        <Menu.Item onClick={handleRename}>
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
            <div>Rename</div>
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
