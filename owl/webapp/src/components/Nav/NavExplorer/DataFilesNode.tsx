import FileMenu from "@components/DataFileMenu";
import RenameFileModal from "@components/RenameFileModal";
import TreeNode from "@components/TreeNode";
import useDataFileStore from "@hooks/datafileStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconFile, IconFolders, IconUpload } from "@tabler/icons-react";
import { IDataFile } from "@ts/interfaces/datafile_interface";
import { useEffect, useRef, useState } from "react";
import "./styles.css";

function toNode(
  file: IDataFile,
  onDelete: (id: number) => void,
  onRename: (file: IDataFile) => void
): TreeNodeData {
  return {
    label: file.name,
    value: `${file.id}`,
    nodeProps: {
      icon: (
        <div>
          <IconFile stroke={1} size={18} color="var(--mantine-color-gray-8)" />
        </div>
      ),
      actions: (
        <FileMenu
          file={file}
          onDelete={onDelete}
          onRename={onRename}
          className="menu-icon"
        />
      ),
    },
  };
}

export default function DataFilesNode() {
  const { datafiles, fetchAll, remove, upload, rename } = useDataFileStore();
  const [selectedFile, setSelectedFile] = useState<IDataFile | null>(null);
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDrop = async (files: FileWithPath[]) => {
    if (files.length === 0) {
      console.log("No files selected");
      notifications.show({
        title: "Error",
        color: "red",
        message: "No files selected",
      });
      return;
    }
    setIsLoading(true);
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      await upload(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = (file: IDataFile) => {
    setSelectedFile(file);
    setIsRenameModalOpen(true);
  };
  const data: TreeNodeData[] = [
    {
      label: "Files",
      value: "files",
      nodeProps: {
        icon: (
          <div>
            <IconFolders stroke={1} color="var(--mantine-color-blue-8)" />
          </div>
        ),
        actions: (
          <ActionIcon
            className="root-node-action-icon"
            loading={isLoading}
            disabled={isLoading}
            variant="transparent"
            onClick={(event) => {
              event.stopPropagation();
              openRef.current?.();
            }}
          >
            <IconUpload stroke={1} />
          </ActionIcon>
        ),
      },
      children: datafiles.map((file) => toNode(file, remove, handleRename)),
    },
  ];

  return (
    <>
      <Dropzone
        maxFiles={1}
        openRef={openRef}
        onDrop={handleDrop}
        accept={[
          MIME_TYPES.csv,
          MIME_TYPES.xlsx,
          MIME_TYPES.xls,
          "application/vnd.apache.parquet",
        ]}
      >
        <Tree
          className="nav-tree"
          selectOnClick
          clearSelectionOnOutsideClick
          data={data}
          renderNode={(payload) => <TreeNode {...payload} />}
        />
      </Dropzone>
      <RenameFileModal
        open={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        file={selectedFile!}
        onRename={rename}
      />
    </>
  );
}
