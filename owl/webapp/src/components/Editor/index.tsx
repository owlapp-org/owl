import { useDatabaseStore } from "@hooks/databaseStore";
import { createEditorStore } from "@hooks/editorStore";
import { ActionIcon, Tabs } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Editor from "./Editor";

export default function EditorTabPanel() {
  const { fetchDatabases } = useDatabaseStore();
  const [editors, setEditors] = useState([
    { id: uuidv4(), store: createEditorStore() },
  ]);
  const [activeTab, setActiveTab] = useState(editors[0].id);

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  const handleAddEditor = () => {
    const newEditor = { id: uuidv4(), store: createEditorStore() };
    setActiveTab(newEditor.id);
    setEditors([...editors, newEditor]);
  };

  const handleTabChange = (tab?: string | null) => {
    console.log(tab);
    if (tab) setActiveTab(tab);
  };

  // return (
  //   <Tabs defaultValue="first">
  //     <Tabs.List>
  //       <Tabs.Tab value="first">First tab</Tabs.Tab>
  //       <Tabs.Tab value="second">Second tab</Tabs.Tab>
  //       <ActionIcon variant="transparent" onClick={handleAddEditor}>
  //         <IconPlus size={20} stroke={1} />
  //       </ActionIcon>
  //     </Tabs.List>

  //     <Tabs.Panel value="first">First panel</Tabs.Panel>
  //     <Tabs.Panel value="second">Second panel</Tabs.Panel>
  //   </Tabs>
  // );

  return (
    <Tabs value={activeTab} onChange={(t) => handleTabChange(t)}>
      {/* <ScrollArea scrollbarSize={0} style={{ width: "100%", display: "flex" }}> */}
      <Tabs.List
        className="editor-tab-list"
        style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
      >
        {editors.map((editor) => (
          <Tabs.Tab
            key={editor.id}
            w={140}
            px={4}
            value={editor.id}
            className="editor-tab"
            rightSection={
              <IconX stroke={1} className="editor-tab-close-icon" />
            }
          >
            Query 1
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
