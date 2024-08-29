import CreateScriptModal from "@components/modals/CreateScriptModal";
import RenameFileModal from "@components/modals/RenameFileModal";
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
import { IScript } from "@ts/interfaces/script_interface";
import { useEffect, useRef, useState } from "react";
import "./styles.css";

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
  const { scripts, create, fetchAll, remove, upload, rename } =
    useScriptStore();
  const [selectedScript, setSelectedScript] = useState<IScript | null>(null);
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isCreateScriptModalOpen, setIsCreateScriptModalOpen] = useState(false);

  const { addTab } = useEditorStore();

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
    setSelectedScript(file);
    setIsRenameModalOpen(true);
  };
  const handleCreate = async (name: string) => {
    setIsLoading(true);
    try {
      await create(name);
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
            }}
          >
            <ActionIcon
              className="root-node-action-icon"
              loading={isLoading}
              disabled={isLoading}
              variant="transparent"
              onClick={(event) => {
                event.stopPropagation();
                setIsCreateScriptModalOpen(true);
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
          addTab(scriptFile.id);
        })
      ),
    },
  ];

  return (
    <>
      <Dropzone maxFiles={1} openRef={openRef} onDrop={handleDrop}>
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
        file={selectedScript!}
        onRename={rename}
      />
      <CreateScriptModal
        open={isCreateScriptModalOpen}
        onClose={() => setIsCreateScriptModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
