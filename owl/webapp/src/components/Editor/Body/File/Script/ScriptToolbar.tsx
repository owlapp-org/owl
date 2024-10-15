import { useExportDataModalStore } from "@components/modals/ExportDataModal/useExportDataModalStore";
import { IEditorScriptTabState } from "@hooks/editorStore";
import { useDatabaseStore } from "@hooks/hooks";
import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  Select,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCubeSend,
  IconDownload,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { StatementType } from "@ts/enums";
import { IScript } from "@ts/interfaces/interfaces";
import { ExecutionStats } from "@ts/models";
import { FC, useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
interface IScriptToolbarProps {
  isRunLoading: boolean;
  isRenderLoading: boolean;
  store: UseBoundStore<StoreApi<IEditorScriptTabState<IScript>>>;
  stats: ExecutionStats | null;
  onExecute: () => void;
  onRender: () => void;
}

interface IExecutionStatsProps {
  stats: ExecutionStats | null;
}

const Stats: FC<IExecutionStatsProps> = ({ stats }) => {
  if (stats != null) {
    return (
      <Box
        px={10}
        display={"flex"}
        style={{ gap: "4px", alignItems: "center" }}
      >
        <div>
          <Text size="xs" c={stats.statusColor()} display={"block"}>
            {stats.displayStatus()}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" display={"block"}>
            {stats.prettyDuration()}
          </Text>
        </div>
      </Box>
    );
  }
  return <></>;
};

const ScriptToolbar: FC<IScriptToolbarProps> = ({
  isRunLoading,
  isRenderLoading,
  store,
  stats,
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
        <Tooltip label="Run">
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
        </Tooltip>
        <Divider orientation="vertical" />
        <Stats stats={stats} />
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
        <Tooltip label="Export result set">
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
        </Tooltip>
        <Divider orientation="vertical" />
        <Tooltip label="Show resolved query">
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
        </Tooltip>
      </div>
    </Flex>
  );
};

export default ScriptToolbar;
