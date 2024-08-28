import { IEditorTabState } from "@hooks/editorStore";
import { Divider, Loader, Menu, Tabs } from "@mantine/core";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";

interface IEditorTabProps {
  id: string;
  index: number;
  store: UseBoundStore<StoreApi<IEditorTabState>>;
  handleCloseTab: (id: string) => void;
}

export default function EditorTab({
  id,
  store,
  index,
  handleCloseTab,
}: IEditorTabProps) {
  const isBusy = store((state) => state.isBusy);
  const file = store((state) => state.file);
  const findFileName = store((state) => state.findFileName);
  const [title, setTitle] = useState(`Query ${index + 1}`);

  const [opened, setOpened] = useState(false);
  const handleContextMenu = (e: any) => {
    e.preventDefault();
    setOpened(true);
  };

  useEffect(() => {
    const filename = findFileName();
    filename && setTitle(filename);
  }, [file, setTitle]);

  const handleSave = () => {
    // todo
    console.log("Save clicked");
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
