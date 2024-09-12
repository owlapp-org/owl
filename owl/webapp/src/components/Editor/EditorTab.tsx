import { useCreateFileModalStore } from "@components/modals/CreateFileModal/useCreateFileModalStore";
import { useRenameFileModalStore } from "@components/modals/RenameFileModal/useRenameFileModalStore";
import useEditorStore, { IEditorTabState } from "@hooks/editorStore";
import { Divider, Loader, Menu, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { FileType } from "@ts/enums/filetype_enum";
import { useEffect, useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import "./styles.css";

interface IEditorTabProps {
  id: string;
  index: number;
  store: UseBoundStore<StoreApi<IEditorTabState>>;
}

const EditorTab: React.FC<IEditorTabProps> = ({ id, store, index }) => {
  const { closeAllTabs, closeTab, closeOtherTabs } = useEditorStore();
  const { file, save, tabId } = useStore(
    store,
    useShallow((state) => ({
      file: state.file,
      save: state.save,
      tabId: state.id,
    }))
  );
  const { showModal: showRenameFileModal } = useRenameFileModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(`New ${index + 1}`);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const handleContextMenu = (e: any) => {
    e.preventDefault();
    setIsContextMenuOpen(true);
  };
  const { showModal: showCreateFileModal } = useCreateFileModalStore();

  useEffect(() => {
    file.name && setTitle(file.name);
  }, [file.name, setTitle]);

  const handleSave = async () => {
    if (file.id) {
      await save();
    } else {
      switch (file.fileType) {
        case FileType.ScriptFile: {
          showCreateFileModal({ fileType: FileType.ScriptFile, tabId });
        }
      }
    }
  };

  const handleRename = () => {
    if (!file.id) {
      notifications.show({
        color: "warning",
        title: "Error",
        message: "File not saved",
      });
      return;
    }
    setIsLoading(true);
    showRenameFileModal({ file: { ...file, fileType: FileType.ScriptFile } });
    setIsLoading(false);
  };

  return (
    <Menu
      shadow="md"
      width={200}
      opened={isContextMenuOpen}
      onClose={() => setIsContextMenuOpen(false)}
      position="bottom-start"
      withArrow
      offset={4}
    >
      <Menu.Target>
        <Tabs.Tab
          w={140}
          px={4}
          value={id}
          className="editor-tab"
          onContextMenu={handleContextMenu}
          rightSection={
            isLoading ? (
              <Loader size="1rem" />
            ) : (
              <IconX
                stroke={1}
                className="editor-tab-close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(id);
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
        <Menu.Item
          onClick={handleRename}
          leftSection={<div style={{ width: "1.2rem" }} />}
        >
          Rename
        </Menu.Item>
        <Divider></Divider>
        <Menu.Item
          leftSection={<IconX stroke={1} size={"1.2rem"} />}
          onClick={() => closeTab(id)}
        >
          Close
        </Menu.Item>
        <Menu.Item
          leftSection={<div style={{ width: "1.2rem" }} />}
          onClick={() => closeOtherTabs(id)}
        >
          Close Others
        </Menu.Item>
        <Menu.Item
          leftSection={<div style={{ width: "1.2rem" }} />}
          onClick={closeAllTabs}
        >
          Close All
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default EditorTab;
