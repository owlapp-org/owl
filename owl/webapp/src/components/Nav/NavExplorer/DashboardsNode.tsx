import FileMenu from "@components/DataFileMenu";
import { useRenameFileModalStore } from "@components/modals/RenameFileModal/useRenameFileModalStore";
import TreeNode from "@components/TreeNode";
import useEditorStore from "@hooks/editorStore";
import { useDashboardStore } from "@hooks/hooks";
import { notify } from "@lib/notify";
import { ActionIcon, Tree, TreeNodeData } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import {
  IconFile3d,
  IconPlus,
  IconReportAnalytics,
  IconUpload,
} from "@tabler/icons-react";
import { FileType } from "@ts/enums/filetype_enum";
import { IDashboardFile, IScript } from "@ts/interfaces/interfaces";
import { useEffect, useRef, useState } from "react";
import "./styles.css";
import "./styles.upload.css";

function toNode(
  dashboardFile: IDashboardFile,
  onDelete: (id: number) => void,
  onRename: (file: IScript) => void,
  onClick: (e: any) => void
): TreeNodeData {
  return {
    label: dashboardFile.name,
    value: `${dashboardFile.id}`,
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
        <FileMenu
          file={dashboardFile}
          onDelete={onDelete}
          onRename={onRename}
          className="menu-icon"
        />
      ),
    },
  };
}

export default function DashboardsNode() {
  const { items: dashboards, fetchAll, remove, upload } = useDashboardStore();
  const openRef = useRef<() => void>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addTab } = useEditorStore();
  const { showModal: showRenameFileModal } = useRenameFileModalStore();
  const { closeTabByFile } = useEditorStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async (id: number) => {
    await remove(id);
    closeTabByFile(id, FileType.DashboardFile);
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
    showRenameFileModal({
      file: { ...file, fileType: FileType.DashboardFile },
    });
  };
  const handleCreate = async () => {
    setIsLoading(true);
    try {
      addTab(FileType.DashboardFile, null);
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
      children: dashboards.map((dashboard) =>
        toNode(dashboard, handleDelete, handleRename, (e: any) => {
          e.stopPropagation();
          addTab(FileType.DashboardFile, dashboard.id);
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
