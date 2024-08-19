import { ActionIcon, Tabs } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import Editor from "./Editor";

export default function EditorTabPanel() {
  return (
    <Tabs defaultValue="settings">
      {/* <ScrollArea scrollbarSize={0} style={{ width: "100%", display: "flex" }}> */}
      <Tabs.List
        className="editor-tab-list"
        style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
      >
        <Tabs.Tab
          w={140}
          px={4}
          value="settings"
          className="editor-tab"
          rightSection={<IconX stroke={1} className="editor-tab-close-icon" />}
        >
          Settings
        </Tabs.Tab>
        <ActionIcon variant="transparent">
          <IconPlus size={20} stroke={1} />
        </ActionIcon>
      </Tabs.List>

      {/* </ScrollArea> */}

      <Tabs.Panel value="settings">
        <Editor />
      </Tabs.Panel>
    </Tabs>
  );
}
