import { useExportDataModalStore } from "@components/modals/ExportDataModal/useExportDataModalStore";
import { IEditorScriptTabState } from "@hooks/editorStore";
import { useDatabaseStore } from "@hooks/hooks";
import { ActionIcon, Divider, Flex, Select } from "@mantine/core";
import {
  IconCubeSend,
  IconDownload,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { StatementType } from "@ts/enums";
import { IScript } from "@ts/interfaces/interfaces";
import { useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface IScriptToolbarProps {
  isRunLoading: boolean;
  isRenderLoading: boolean;
  store: UseBoundStore<StoreApi<IEditorScriptTabState<IScript>>>;
  onExecute: () => void;
  onRender: () => void;
}

const ScriptToolbar: React.FC<IScriptToolbarProps> = ({
  isRunLoading,
  isRenderLoading,
  store,
  onExecute,
  onRender,
}) => {
  const { items: databases } = useDatabaseStore();
  const { getDatabaseId, setDatabaseId, content, lastExecution } = useStore(
    store,
    useShallow((state) => ({
      getDatabaseId: () => state.getOption<string>("databaseId"),
      setDatabaseId: (id: number) => state.setOption("databaseId", id),
      content: state.content,
      lastExecution: state.lastExecution,
    }))
  );
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const { showModal: showExportDataModal } = useExportDataModalStore();

  const databaseSelectOptions = databases.map((database) => ({
    value: database.id.toString(),
    label: database.name,
  }));

  const handleDownload = async () => {
    const { query = "", databaseId = "" } = lastExecution || {};
    showExportDataModal({
      query,
      databaseId,
    });
  };

  return (
    <Flex
      px={0}
      style={{
        width: "100%",
        alignItems: "center",
        borderBottom: "1px solid var(--mantine-color-gray-2)",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0px",
          height: "100%",
        }}
      >
        <Select
          miw={200}
          placeholder={"Using in-memory database"}
          data={databaseSelectOptions}
          value={getDatabaseId()}
          onChange={(v: string | null) =>
            v != null && setDatabaseId(Number.parseInt(v))
          }
          styles={(theme) => ({
            input: {
              border: "none",
            },
          })}
        />
        <Divider orientation="vertical" />
        <ActionIcon
          h="100%"
          radius={0}
          p={0}
          disabled={!content.trim()}
          aria-label="Run"
          variant="transparent"
          miw={40}
          onClick={onExecute}
          loading={isRunLoading}
        >
          <IconPlayerPlay stroke={1} />
        </ActionIcon>
        <Divider orientation="vertical" />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0px",
          height: "100%",
        }}
      >
        <Divider orientation="vertical" />
        <ActionIcon
          h="100%"
          radius={0}
          p={0}
          disabled={
            !lastExecution ||
            lastExecution["statement_type"] != StatementType.SELECT
          }
          aria-label="Run"
          variant="transparent"
          miw={40}
          onClick={handleDownload}
          loading={isDownloadLoading}
        >
          <IconDownload stroke={1} />
        </ActionIcon>
        <Divider orientation="vertical" />
        <ActionIcon
          h="100%"
          radius={0}
          p={0}
          disabled={!content.trim()}
          aria-label="Run"
          variant="transparent"
          miw={40}
          onClick={onRender}
          loading={isRenderLoading}
        >
          <IconCubeSend stroke={1} />
        </ActionIcon>
      </div>
    </Flex>
  );
};

export default ScriptToolbar;
