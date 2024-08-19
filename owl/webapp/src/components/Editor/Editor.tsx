import { useDatabaseStore } from "@hooks/databaseStore";
import { EditorStore } from "@hooks/editorStore";
import { ActionIcon, Divider, Flex, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlayerPlay } from "@tabler/icons-react";
import { QueryResult } from "@ts/interfaces/database_interface";
import { useRef, useState } from "react";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import Code, { ExtendedReactCodeMirrorRef } from "./Code";
import Panel from "./Panel";
import "./styles.css";

interface IEditorProps {
  store: UseBoundStore<StoreApi<EditorStore>>;
}

export default function Editor({ store }: IEditorProps) {
  const [loading, setLoading] = useState(false);
  const { databases } = useDatabaseStore();
  const { run, code, setDatabase, selectedDatabase } = useStore(store);
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);
  const [result, setResult] = useState<QueryResult>();

  const databaseOptions = databases.map((database) => ({
    value: database.id.toString(),
    label: database.name,
  }));

  async function handleExecute(selectedLines: string[]) {
    if (!selectedDatabase) {
      notifications.show({
        title: "Warning",
        color: "yellow",
        message: `Select a database from the list`,
      });
      return;
    }
    if (code.trim() === "") {
      return;
    }

    let query = selectedLines.join("\n").trim();
    if (!query) {
      query = code.trim();
    }

    try {
      setLoading(true);
      // todo hardcoded values
      const res = await run(Number.parseInt(selectedDatabase), query, 0, 25);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  const handleButtonClick = () => {
    if (codeRef.current) {
      const selectedLines = codeRef.current?.getSelectedLines?.() ?? [];
      handleExecute(selectedLines);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh)",
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid #E9ECEF",
      }}
    >
      <div
        style={{
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Flex
          px={10}
          style={{
            width: "100%",
            alignItems: "center",
            borderBottom: "1px solid var(--mantine-color-gray-2)",
          }}
        >
          <Select
            placeholder="Database"
            data={databaseOptions}
            value={selectedDatabase}
            onChange={setDatabase}
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
            disabled={code.trim() === "" || !selectedDatabase}
            aria-label="Run"
            variant="transparent"
            miw={40}
            onClick={handleButtonClick}
            loading={loading}
          >
            <IconPlayerPlay stroke={1} />
          </ActionIcon>
          <Divider orientation="vertical" />
        </Flex>
      </div>
      <PanelGroup direction="vertical">
        <ResizablePanel>
          <div style={{ flex: 1, overflow: "hidden", height: "100%" }}>
            <Code ref={codeRef} store={store} onExecute={handleExecute} />
          </div>
        </ResizablePanel>
        <PanelResizeHandle className="panel-resize-handle" />
        <ResizablePanel maxSize={90} minSize={10}>
          <Panel result={result} />
        </ResizablePanel>
      </PanelGroup>
    </div>
  );
}
