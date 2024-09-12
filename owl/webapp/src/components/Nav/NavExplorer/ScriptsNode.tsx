import { useCreateFileModalStore } from "@components/modals/CreateFileModal/useCreateFileModalStore";
import { useRenameFileModalStore } from "@components/modals/RenameFileModal/useRenameFileModalStore";
import ScriptMenu from "@components/ScriptMenu";
import TreeNode from "@components/TreeNode";
import useEditorStore from "@hooks/editorStore";
import useScriptStore from "@hooks/scriptStore";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import {
  IconCodeDots,
  IconFileTypeSql,
  IconPlus,
  IconUpload,
} from "@tabler/icons-react";
import { FileType } from "@ts/enums/filetype_enum";
import { IScript } from "@ts/interfaces/script_interface";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import "./styles.upload.css";

function toNode(
  script: IScript,
  onDelete: (id: number) => void,
  onRename: (file: IScript) => void,
  onClick: (e: any) => void
): TreeNodeData {
  return {
    label: script.name,
    value: `${script.id}`,
    nodeProps: {
      onClick,
      icon: (
        <div>
          <IconFileTypeSql
            stroke={1}
            size={18}
            color="var(--mantine-color-gray-8)"
          />
        </div>
      ),
      actions: (
        <ScriptMenu
          script={script}
          onDelete={onDelete}
          onRename={onRename}
          className="menu-icon"
        />
      ),
    },
  };
}

export default function ScriptsNode() {
  const { scripts, fetchAll, remove, upload } = useScriptStore();
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addTab } = useEditorStore();
  const { showModal: showRenameFileModal } = useRenameFileModalStore();
  const { showModal: showCreateScriptModal } = useCreateFileModalStore();

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
    showRenameFileModal({ file: { ...file, fileType: FileType.ScriptFile } });
  };
  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await showCreateScriptModal({
        fileType: FileType.ScriptFile,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const data: TreeNodeData[] = [
    {
      label: "Scripts",
      value: "scripts",
      nodeProps: {
        icon: (
          <div>
            <IconCodeDots stroke={1} color="var(--mantine-color-blue-8)" />
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
      children: scripts.map((scriptFile) =>
        toNode(scriptFile, remove, handleRename, (e: any) => {
          e.stopPropagation();
          addTab(scriptFile.id, FileType.ScriptFile);
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
