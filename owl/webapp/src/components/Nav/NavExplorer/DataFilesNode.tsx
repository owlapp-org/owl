import FileMenu from "@components/DataFileMenu";
import { useRenameFileModalStore } from "@components/modals/RenameFileModal/useRenameFileModalStore";
import TreeNode from "@components/TreeNode";
import useDataFileStore from "@hooks/datafileStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconFile,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconFolders,
  IconUpload,
} from "@tabler/icons-react";
import { FileType } from "@ts/enums/filetype_enum";
import { IDataFile } from "@ts/interfaces/datafile_interface";
import { useEffect, useRef, useState } from "react";
import "./styles.css";

function toNode(
  file: IDataFile,
  onDelete: (id: number) => void,
  onRename: (file: IDataFile) => void
): TreeNodeData {
  const icon = () => {
    if (file.name.endsWith(".csv")) {
      return (
        <IconFileTypeCsv
          stroke={1}
          size={18}
          color="var(--mantine-color-gray-8)"
        />
      );
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xlsx")) {
      return (
        <IconFileTypeXls
          stroke={1}
          size={18}
          color="var(--mantine-color-gray-8)"
        />
      );
    }
    return (
      <IconFile stroke={1} size={18} color="var(--mantine-color-gray-8)" />
    );
  };

  return {
    label: file.name,
    value: `${file.id}`,
    nodeProps: {
      icon: <div>{icon()}</div>,
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
  const { datafiles, fetchAll, remove, upload } = useDataFileStore();
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showModal: showRenameFileModal } = useRenameFileModalStore();

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
    showRenameFileModal({ file: { ...file, fileType: FileType.DataFile } });
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
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
            }}
          >
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
          </div>
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
        className="file-upload"
      >
        <Tree
          className="nav-tree"
          selectOnClick
          clearSelectionOnOutsideClick
          data={data}
          renderNode={(payload) => <TreeNode {...payload} />}
        />
      </Dropzone>
    </>
  );
}
