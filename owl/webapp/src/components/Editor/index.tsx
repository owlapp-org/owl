import { useDatabaseStore } from "@hooks/databaseStore";
import useEditorStore from "@hooks/editorStore";
import { ActionIcon, Tabs } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useEffect } from "react";
import EditorTab from "./EditorTab";
import ZeroTabs from "./ZeroTabs";

export default function EditorTabPanel() {
  const { fetchDatabases } = useDatabaseStore();

  const { addTab, closeTab, tabs, getTabCount, activeTab, setActiveTab } =
    useEditorStore();

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleAddTab = () => {
    addTab();
  };

  const handleCloseTab = (id: string) => {
    closeTab(id);
  };

  if (getTabCount() == 0) {
    return <ZeroTabs onNewTab={handleAddTab} />;
  }
  return (
    <Tabs value={activeTab} onChange={(t) => t && setActiveTab(t)}>
      {/* <ScrollArea scrollbarSize={0} style={{ width: "100%", display: "flex" }}> */}
      <Tabs.List
        className="editor-tab-list"
        style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
      >
        {Object.entries(tabs).map(([id, store], index) => (
          <Tabs.Tab
            key={id}
            w={140}
            px={4}
            value={id}
            className="editor-tab"
            rightSection={
              <IconX
                stroke={1}
                className="editor-tab-close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(id);
                }}
              />
            }
          >
            {store.getState().script?.name || "Query " + (index + 1)}
          </Tabs.Tab>
        ))}
        <ActionIcon variant="transparent" onClick={handleAddTab}>
          <IconPlus size={20} stroke={1} />
        </ActionIcon>
      </Tabs.List>
      {/* </ScrollArea> */}

      {Object.entries(tabs).map(([id, store]) => (
        <Tabs.Panel key={id} value={id}>
          <EditorTab store={store} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
