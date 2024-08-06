import useEditorStore from "@hooks/editorStore";
import { useDatabaseStore } from "@hooks/useDatabaseStore";
import { ActionIcon, Divider, Flex, Select } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
import Code, { ExtendedReactCodeMirrorRef } from "./Code";
import Panel from "./Panel";
import "./styles.css";

export default function Editor() {
  const [loading, setLoading] = useState(false);
  const { databases, fetchDatabases } = useDatabaseStore();
  const { run, code, setDatabase, selectedDatabase } = useEditorStore();
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const databaseOptions = databases.map((database) => ({
    value: database.id.toString(),
    label: database.name,
  }));

  async function handleExecute(selectedLines: string[]) {
    if (!selectedDatabase || code.trim() === "") {
      return;
    }

    let query = selectedLines.join("\n").trim();
    if (!query) {
      query = code.trim();
    }

    try {
      setLoading(true);
      // todo hardcoded values
      await run(Number.parseInt(selectedDatabase), query, 0, 25);
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
          className="editor-toolbar"
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
            <Code ref={codeRef} onExecute={handleExecute} />
          </div>
        </ResizablePanel>
        <PanelResizeHandle className="panel-resize-handle" />
        <ResizablePanel maxSize={90} minSize={10}>
          <Panel />
        </ResizablePanel>
      </PanelGroup>
    </div>
  );
}
