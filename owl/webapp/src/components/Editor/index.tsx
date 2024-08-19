import { useDatabaseStore } from "@hooks/databaseStore";
import { createEditorStore } from "@hooks/editorStore";
import { ActionIcon, Tabs } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Editor from "./Editor";
import ZeroTabs from "./ZeroTabs";

export default function EditorTabPanel() {
  const { fetchDatabases } = useDatabaseStore();
  const [editors, setEditors] = useState([
    { id: uuidv4(), store: createEditorStore() },
  ]);

  const [activeTab, setActiveTab] = useState(
    editors.length > 0 ? editors[0].id : undefined
  );

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleAddEditor = () => {
    const newEditor = { id: uuidv4(), store: createEditorStore() };
    setActiveTab(newEditor.id);
    setEditors([...editors, newEditor]);
  };

  const handleCloseEditor = (editorId: string) => {
    const updatedEditors = editors.filter((editor) => editor.id !== editorId);
    setEditors(updatedEditors);
    if (activeTab === editorId && updatedEditors.length > 0) {
      setActiveTab(updatedEditors[0].id);
    } else if (updatedEditors.length === 0) {
      setActiveTab("");
    }
  };

  if (editors.length == 0) {
    return <ZeroTabs onNewTab={handleAddEditor} />;
  }
  return (
    <Tabs value={activeTab} onChange={(t) => t && setActiveTab(t)}>
      {/* <ScrollArea scrollbarSize={0} style={{ width: "100%", display: "flex" }}> */}
      <Tabs.List
        className="editor-tab-list"
        style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
      >
        {editors.map((editor, index) => (
          <Tabs.Tab
            key={editor.id}
            w={140}
            px={4}
            value={editor.id}
            className="editor-tab"
            rightSection={
              <IconX
                stroke={1}
                className="editor-tab-close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseEditor(editor.id);
                }}
              />
            }
          >
            Query {index + 1}
          </Tabs.Tab>
        ))}
        <ActionIcon variant="transparent" onClick={handleAddEditor}>
          <IconPlus size={20} stroke={1} />
        </ActionIcon>
      </Tabs.List>
      {/* </ScrollArea> */}

      {editors.map((editor) => (
        <Tabs.Panel key={editor.id} value={editor.id}>
          <Editor store={editor.store} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
