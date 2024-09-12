import { IEditorMacroFileTabState } from "@hooks/editorStore";
import { CodeHighlight } from "@mantine/code-highlight";
import "@mantine/code-highlight/styles.css";
import { ActionIcon, Divider, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import MacroFileService from "@services/macrofileService";
import { IconFile3d, IconPlayerPlay } from "@tabler/icons-react";
import { useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";

interface IMacroFilePanelProps {
  store: UseBoundStore<StoreApi<IEditorMacroFileTabState>>;
}

const Panel: React.FC<IMacroFilePanelProps> = ({ store }) => {
  const [command, setCommand] = useState("");
  const [renderedContent, setRenderedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { content } = useStore(store);

  const handleRenderClick = async () => {
    setIsLoading(true);
    try {
      const result: any = await MacroFileService.renderContent(
        content,
        command
      );
      setRenderedContent(result["content"]);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to render. ${err}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <TextInput
          placeholder="Enter prompt to test macros and variables"
          radius={0}
          styles={{
            input: {
              border: 0,
              outline: 0,
            },
          }}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "0px",
            backgroundColor: "transparent",
          }}
          onChange={(e) => setCommand(e.target.value)}
        />
        <Divider orientation="vertical" />
        <ActionIcon
          h="100%"
          radius={0}
          p={0}
          aria-label="Run"
          variant="transparent"
          miw={40}
          disabled={!command}
          onClick={handleRenderClick}
          loading={isLoading}
        >
          <IconPlayerPlay stroke={1} />
        </ActionIcon>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          // justifyContent: "center",
        }}
      >
        <div
          className="macro-render-panel-welcome"
          style={{
            display: "flex",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!renderedContent && (
              <>
                <div>
                  <IconFile3d
                    size={48}
                    stroke={1}
                    color="var(--mantine-color-gray-2)"
                  />
                </div>
                <div style={{ color: "var(--mantine-color-gray-4)" }}>
                  Results will be rendered here
                </div>
              </>
            )}
            {renderedContent !== null && (
              <CodeHighlight
                className="app-code-highlight macro-code-highlight"
                styles={{
                  root: {
                    marginTop: "0px !important;",
                    paddingTop: "0px",
                  },
                }}
                style={{
                  marginTop: "0px !important;",
                  padding: "0px",
                  width: "100%",
                  height: "100%",
                  flexGrow: "1",
                }}
                code={renderedContent}
                language="sql"
                mt="md"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;
