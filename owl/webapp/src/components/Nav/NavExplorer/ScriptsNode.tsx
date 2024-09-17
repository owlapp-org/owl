import { useRenameFileModalStore } from "@components/modals/RenameFileModal/useRenameFileModalStore";
import ScriptMenu from "@components/ScriptMenu";
import TreeNode from "@components/TreeNode";
import useEditorStore from "@hooks/editorStore";
import { useScriptStore } from "@hooks/hooks";
import { notify } from "@lib/notify";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconCodeDots, IconFileTypeSql, IconUpload } from "@tabler/icons-react";
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
  const { items: scripts, fetchAll, remove, upload } = useScriptStore();
  const { closeTabByFile } = useEditorStore();
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addTab } = useEditorStore();
  const { showModal: showRenameFileModal } = useRenameFileModalStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = (id: number) => {
    remove(id);
    closeTabByFile(id, FileType.ScriptFile);
  };
  const handleDrop = async (files: FileWithPath[]) => {
    if (files.length === 0) {
      notify.error("No script file selected");
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
        toNode(scriptFile, handleDelete, handleRename, (e: any) => {
          e.stopPropagation();
          addTab(FileType.ScriptFile, scriptFile.id);
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
