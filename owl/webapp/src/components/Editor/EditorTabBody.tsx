import CreateDatabaseModal from "@components/Database/CreateDatabaseModal";
import { useDatabaseStore } from "@hooks/databaseStore";
import { IEditorTabStore } from "@hooks/editorStore";
import { useScriptStore } from "@hooks/scriptStore";
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Loader,
  Select,
} from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { QueryResult } from "@ts/interfaces/database_interface";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import Code, { ExtendedReactCodeMirrorRef } from "./Code";
import Panel from "./Panel";
import "./styles.css";

interface EditorTabBodyProps {
  store: UseBoundStore<StoreApi<IEditorTabStore>>;
}

export default function EditorTabBody({ store }: EditorTabBodyProps) {
  const [loading, setLoading] = useState(false);
  const { databases } = useDatabaseStore();
  const { scriptId, run, code, setDatabase, selectedDatabase, setCode } =
    useStore(store);
  const codeRef = useRef<ExtendedReactCodeMirrorRef>(null);
  const [result, setResult] = useState<QueryResult>();
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const { getScriptContent } = useScriptStore();
  const [isCreateDatabaseModalOpen, setIsCreateDatabaseModalOpen] =
    useState(false);

  useCallback(() => {
    console.log(code);
  }, [code]);

  useEffect(() => {
    if (scriptId) {
      setIsScriptLoading(true);
      getScriptContent(scriptId)
        .then((content) => {
          content && setCode(content);
        })
        .finally(() => {
          setIsScriptLoading(false);
        });
    }
  }, [scriptId]);

  const databaseOptions = databases.map((database) => ({
    value: database.id.toString(),
    label: database.name,
  }));

  async function handleExecute(selectedLines: string[]) {
    // if (!selectedDatabase) {
    //   notifications.show({
    //     title: "Warning",
    //     color: "yellow",
    //     message: `Select a database from the list`,
    //   });
    //   return;
    // }
    if (code.trim() === "") {
      return;
    }

    let query = selectedLines.join("\n").trim();
    if (!query) {
      query = code.trim();
    }

    try {
      setLoading(true);
      const databaseId = !selectedDatabase
        ? null
        : Number.parseInt(selectedDatabase);
      const res = await run(databaseId, query, 0, 25); // todo hardcoded values
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  const handleExecuteButtonClick = () => {
    if (codeRef.current) {
      const selectedLines = codeRef.current?.getSelectedLines?.() ?? [];
      handleExecute(selectedLines);
    }
  };

  const handleDatabaseSelectClick = () => {
    if ((!databases || databases.length === 0) && !isCreateDatabaseModalOpen) {
      setIsCreateDatabaseModalOpen(true);
    }
  };

  if (isScriptLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 90px)",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader type="bars" />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 90px)",
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
          {databases.length == 0 ? (
            <Button
              miw={200}
              variant="transparent"
              onClick={handleDatabaseSelectClick}
            >
              Add database
            </Button>
          ) : (
            <Select
              miw={200}
              placeholder={"Using in-memory database"}
              data={databaseOptions}
              value={selectedDatabase}
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
            disabled={code.trim() === ""}
            aria-label="Run"
            variant="transparent"
            miw={40}
            onClick={handleExecuteButtonClick}
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
          <Panel result={result} store={store} />
        </ResizablePanel>
      </PanelGroup>
      <CreateDatabaseModal
        open={isCreateDatabaseModalOpen}
        onClose={() => setIsCreateDatabaseModalOpen(false)}
      />
    </div>
  );
}
