// src/components/DatabaseMenu.tsx
import { useAlertDialog } from "@contexts/AlertDialogContext";
import { notify } from "@lib/notify";
import { ActionIcon, Menu } from "@mantine/core";
import { dataFileService } from "@services/services";
import {
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { IDataFile } from "@ts/interfaces/datafile_interface";

interface IDataFileMenuProps {
  file: IDataFile;
  className?: string;
  onDelete: (id: number) => void;
  onRename: (file: IDataFile) => void;
}

export default function FileMenu({
  file,
  onDelete,
  onRename,
  className,
}: IDataFileMenuProps) {
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

  const handleCopyPath = async () => {
    await navigator.clipboard.writeText(`'{{files}}/${file.name}'`);
    notify.info("Copied file path");
  };
  const handleDownload = async () => {
    const { id, name } = file;
    try {
      await dataFileService.download(id, name);
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
        <Menu.Item onClick={handleCopyPath}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div>
              <IconCopy size={16} stroke={1} />
            </div>
            <div>Copy path</div>
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
        <Menu.Item onClick={() => onRename(file)}>
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
