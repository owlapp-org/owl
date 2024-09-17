// src/components/DatabaseMenu.tsx
import { useAlertDialog } from "@contexts/AlertDialogContext";
import { notify } from "@lib/notify";
import { ActionIcon, Menu } from "@mantine/core";
import { macroFileService } from "@services/services";
import {
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { IMacroFile, IScript } from "@ts/interfaces/interfaces";

interface IMacroFileMenuProps {
  macrofile: IMacroFile;
  className?: string;
  onDelete: (id: number) => void;
  onRename: (script: IScript) => void;
}

export default function ScriptMenu({
  macrofile,
  className,
  onDelete,
  onRename,
}: IMacroFileMenuProps) {
  const { showDialog } = useAlertDialog();

  const handleDelete = (e: any) => {
    e.stopPropagation();
    showDialog({
      title: "Confirm Delete",
      body: `Are you sure you want to delete the macro file ${macrofile.name}?`,
      okButtonLabel: "Delete",
      cancelButtonLabel: "Cancel",
      onOk: () => onDelete(macrofile.id),
    });
  };

  const handleRename = (e: any) => {
    e.stopPropagation();
    onRename(macrofile);
  };
  const handleDownload = async () => {
    const { id, name } = macrofile;
    try {
      await macroFileService.download(id, name);
    } catch (error) {
      notify.error(`Error downloading file. ${error}`);
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
