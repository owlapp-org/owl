// src/components/DatabaseMenu.tsx
import { useAlertDialog } from "@contexts/AlertDialogContext";
import { ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { IScript } from "@ts/interfaces/script_interface";

interface ScriptMenuProps {
  script: IScript;
  onDelete: (id: number) => void;
  onRename: (script: IScript) => void;
  className?: string;
}

export default function ScriptMenu({
  script,
  onDelete,
  onRename,
  className,
}: ScriptMenuProps) {
  const { showDialog } = useAlertDialog();

  const handleDelete = (e: any) => {
    e.stopPropagation();
    showDialog({
      title: "Confirm Delete",
      body: `Are you sure you want to delete the script ${script.name}?`,
      okButtonLabel: "Delete",
      cancelButtonLabel: "Cancel",
      onOk: () => onDelete(script.id),
    });
  };

  const handleRename = (e: any) => {
    e.stopPropagation();
    onRename(script);
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
