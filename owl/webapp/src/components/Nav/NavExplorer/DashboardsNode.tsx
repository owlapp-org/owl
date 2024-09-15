import MacroFileMenu from "@components/MacroFileMenu";
import { useRenameFileModalStore } from "@components/modals/RenameFileModal/useRenameFileModalStore";
import TreeNode from "@components/TreeNode";
import useEditorStore from "@hooks/editorStore";
import useMacroFileStore from "@hooks/macrofileStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconFile3d,
  IconPlus,
  IconReportAnalytics,
  IconUpload,
} from "@tabler/icons-react";
import { FileType } from "@ts/enums/filetype_enum";
import { IMacroFile } from "@ts/interfaces/macrofile_interface";
import { IScript } from "@ts/interfaces/script_interface";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import "./styles.upload.css";

function toNode(
  macrofile: IMacroFile,
  onDelete: (id: number) => void,
  onRename: (file: IScript) => void,
  onClick: (e: any) => void
): TreeNodeData {
  return {
    label: macrofile.name,
    value: `${macrofile.id}`,
    nodeProps: {
      onClick,
      icon: (
        <div>
          <IconFile3d
            stroke={1}
            size={18}
            color="var(--mantine-color-gray-8)"
          />
        </div>
      ),
      actions: (
        <MacroFileMenu
          macrofile={macrofile}
          onDelete={onDelete}
          onRename={onRename}
          className="menu-icon"
        />
      ),
    },
  };
}

export default function MacroFilesNode() {
  const { macrofiles, fetchAll, remove, upload } = useMacroFileStore();
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addTab } = useEditorStore();
  const { showModal: showRenameFileModal } = useRenameFileModalStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDrop = async (files: FileWithPath[]) => {
    if (files.length === 0) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "No script file selected",
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
  const handleRename = (file: IScript) => {
    showRenameFileModal({ file: { ...file, fileType: FileType.MacroFile } });
  };
  const handleCreate = async () => {
    setIsLoading(true);
    try {
      addTab(null, FileType.MacroFile);
    } finally {
      setIsLoading(false);
    }
  };
  const data: TreeNodeData[] = [
    {
      label: "Dashboards",
      value: "dashboards",
      nodeProps: {
        icon: (
          <div>
            <IconReportAnalytics
              stroke={1}
              color="var(--mantine-color-blue-8)"
            />
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
              onClick={async (event) => {
                event.stopPropagation();
                await handleCreate();
              }}
            >
              <IconPlus stroke={1} />
            </ActionIcon>
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
      children: macrofiles.map((macrofile) =>
        toNode(macrofile, remove, handleRename, (e: any) => {
          e.stopPropagation();
          addTab(macrofile.id, FileType.MacroFile);
        })
      ),
    },
  ];

  return (
    <>
      <Dropzone
        maxFiles={1}
        openRef={openRef}
        onDrop={handleDrop}
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
