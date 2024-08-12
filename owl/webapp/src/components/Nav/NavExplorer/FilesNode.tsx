import FileMenu from "@components/FileMenu";
import RenameFileModal from "@components/RenameFileModal";
import TreeNode from "@components/TreeNode";
import { useFileStore } from "@hooks/fileStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconFile, IconFolders, IconPlus } from "@tabler/icons-react";
import { IFile } from "@ts/interfaces/file_interface";
import { useEffect, useRef, useState } from "react";
import "./styles.css";

function fileToTreeNodeData(
  file: IFile,
  onDelete: (id: number) => void,
  onRename: (file: IFile) => void
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
      action: (
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

export default function FilesNode() {
  const { files, fetchFiles, removeFile, upload } = useFileStore();
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const openRef = useRef<() => void>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

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
    setLoading(true);
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    await upload(formData);
    setLoading(false);
  };

  const handleRenameFile = (file: IFile) => {
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
        action: (
          <ActionIcon
            loading={loading}
            disabled={loading}
            variant="transparent"
            onClick={(event) => {
              event.stopPropagation();
              openRef.current?.();
            }}
          >
            <IconPlus stroke={1} />
          </ActionIcon>
        ),
      },
      children: files.map((file) =>
        fileToTreeNodeData(file, removeFile, handleRenameFile)
      ),
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
          selectOnClick
          clearSelectionOnOutsideClick
          data={data}
          renderNode={(payload) => <TreeNode {...payload} />}
        />
      </Dropzone>
      <RenameFileModal
        open={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        file={selectedFile}
      />
    </>
  );
}
