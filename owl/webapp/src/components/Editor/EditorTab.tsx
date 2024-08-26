import { IEditorTabStore } from "@hooks/editorStore";
import { useScriptStore } from "@hooks/scriptStore";
import { Divider, Loader, Menu, Tabs } from "@mantine/core";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";

interface EditorTabProps {
  id: string;
  index: number;
  store: UseBoundStore<StoreApi<IEditorTabStore>>;
  handleCloseTab: (id: string) => void;
}

export default function EditorTab({
  id,
  store,
  index,
  handleCloseTab,
}: EditorTabProps) {
  const isBusy = store((state) => state.isBusy);
  const scriptId = store((state) => state.scriptId);
  const createScript = store((state) => state.createScript);
  const saveScriptContent = store((state) => state.saveScriptContent);
  const { scripts } = useScriptStore();
  const [title, setTitle] = useState(`Query ${index + 1}`);

  const [opened, setOpened] = useState(false);
  const handleContextMenu = (e: any) => {
    e.preventDefault();
    setOpened(true);
  };

  useEffect(() => {
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].id === scriptId) {
        setTitle(scripts[i].name);
        return;
      }
    }
  }, [scripts, scriptId]);

  const handleSave = () => {
    if (scriptId) {
    }
  };

  return (
    <Menu
      shadow="md"
      width={200}
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom-start" // Position it relative to the tab
      withArrow
      offset={4} // Adjust this value if needed
    >
      <Menu.Target>
        <Tabs.Tab
          w={140}
          px={4}
          value={id}
          className="editor-tab"
          onContextMenu={handleContextMenu}
          rightSection={
            isBusy ? (
              <Loader size="1rem" />
            ) : (
              <IconX
                stroke={1}
                className="editor-tab-close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(id);
                }}
              />
            )
          }
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Tabs.Tab>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={handleSave}
          leftSection={<IconDeviceFloppy stroke={1} size={"1.2rem"} />}
        >
          Save
        </Menu.Item>
        <Menu.Item leftSection={<div style={{ width: "1.2rem" }} />}>
          Rename
        </Menu.Item>
        <Divider></Divider>
        <Menu.Item
          leftSection={<IconX stroke={1} size={"1.2rem"} />}
          onClick={() => handleCloseTab(id)}
        >
          Close
        </Menu.Item>
        <Menu.Item
          leftSection={<div style={{ width: "1.2rem" }} />}
          onClick={() => handleCloseTab(id)}
        >
          Close Others
        </Menu.Item>
        <Menu.Item
          leftSection={<div style={{ width: "1.2rem" }} />}
          onClick={() => handleCloseTab(id)}
        >
          Close All
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
