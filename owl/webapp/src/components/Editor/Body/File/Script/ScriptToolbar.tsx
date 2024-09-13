import { useCreateDatabaseModalStore } from "@components/modals/CreateDatabaseModal/useCreateDatabaseModalStore";
import useDatabaseStore from "@hooks/databaseStore";
import { IEditorScriptTabState } from "@hooks/editorStore";
import { ActionIcon, Button, Divider, Flex, Select } from "@mantine/core";
import { IconCubeSend, IconPlayerPlay } from "@tabler/icons-react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface IScriptToolbarProps {
  isRunLoading: boolean;
  isRenderLoading: boolean;
  store: UseBoundStore<StoreApi<IEditorScriptTabState>>;
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
  const { databases } = useDatabaseStore();
  const { setDatabase, options, content } = useStore(
    store,
    useShallow((state) => ({
      setDatabase: state.setDatabase,
      options: state.options,
      content: state.content,
    }))
  );
  const { showModal: showCreateDatabaseModal } = useCreateDatabaseModalStore();

  const databaseSelectOptions = databases.map((database) => ({
    value: database.id.toString(),
    label: database.name,
  }));

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
        {databases.length == 0 ? (
          <Button
            miw={200}
            variant="transparent"
            onClick={() => showCreateDatabaseModal({})}
          >
            Add database
          </Button>
        ) : (
          <Select
            miw={200}
            placeholder={"Using in-memory database"}
            data={databaseSelectOptions}
            value={options?.databaseId}
            onChange={setDatabase}
            styles={(theme) => ({
              input: {
                border: "none",
              },
            })}
          />
        )}
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
