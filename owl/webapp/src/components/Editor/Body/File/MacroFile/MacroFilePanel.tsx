import { IEditorMacroFileTabState } from "@hooks/editorStore";
import { ActionIcon, Divider, TextInput } from "@mantine/core";
import { IconFile3d, IconPlayerPlay } from "@tabler/icons-react";
import { useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";

interface IMacroFilePanelProps {
  store: UseBoundStore<StoreApi<IEditorMacroFileTabState>>;
}

const Panel: React.FC<IMacroFilePanelProps> = ({ store }) => {
  const [command, setCommand] = useState("");

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
          justifyContent: "center",
        }}
      >
        <div className="macro-render-panel-welcome">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;
