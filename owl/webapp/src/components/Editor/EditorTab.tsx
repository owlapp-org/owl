import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

const EditorTab = ({}) => (
  <div
    style={{
      backgroundColor: "#E7F5FF",
      width: "200px",
      height: "100%",
      display: "flex",
      justifyContent: "space-between",
      paddingLeft: "10px",
      paddingRight: "0px",
      alignItems: "center",
      borderRight: "1px solid var(--mantine-color-gray-2)",
    }}
  >
    <div>Some Label</div>
    <ActionIcon variant="transparent" p={0}>
      <IconX size={16} stroke={1} style={{ padding: 0 }} />
    </ActionIcon>
  </div>
);

export default EditorTab;
