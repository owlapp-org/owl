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

  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  return (
    <Tabs defaultValue={editors[0].id}>
      {/* <ScrollArea scrollbarSize={0} style={{ width: "100%", display: "flex" }}> */}
      <div>
        <Tabs.List
          className="editor-tab-list"
          // style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
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
          <ActionIcon variant="transparent">
            <IconPlus size={20} stroke={1} />
          </ActionIcon>
        </Tabs.List>
      </div>
      {/* </ScrollArea> */}

      {editors.map((editor) => (
        <Tabs.Panel key={editor.id} value={editor.id}>
          <Editor store={editor.store} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
