import useDatabaseStore from "@hooks/databaseStore";
import { IEditorTabState } from "@hooks/editorStore";
import { ActionIcon, Button, Divider, Flex, Select } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { StoreApi, UseBoundStore, useStore } from "zustand";

interface IScriptToolbarProps {
  isLoading: boolean;
  store: UseBoundStore<StoreApi<IEditorTabState>>;
  onExecute: () => void;
}

const ScriptToolbar: React.FC<IScriptToolbarProps> = ({
  isLoading,
  store,
  onExecute,
}) => {
  const { databases, setIsCreateModalOpen } = useDatabaseStore();
  const { setDatabase, options, file } = useStore(store);

  const databaseSelectOptions = databases.map((database) => ({
    value: database.id.toString(),
    label: database.name,
  }));

  return (
    <Flex
      px={10}
      style={{
        width: "100%",
        alignItems: "center",
        borderBottom: "1px solid var(--mantine-color-gray-2)",
      }}
    >
      {databases.length == 0 ? (
        <Button
          miw={200}
          variant="transparent"
          onClick={() => setIsCreateModalOpen(true)}
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
        disabled={file.content?.trim() === ""}
        aria-label="Run"
        variant="transparent"
        miw={40}
        onClick={onExecute}
        loading={isLoading}
      >
        <IconPlayerPlay stroke={1} />
      </ActionIcon>
      <Divider orientation="vertical" />
    </Flex>
  );
};

export default ScriptToolbar;
