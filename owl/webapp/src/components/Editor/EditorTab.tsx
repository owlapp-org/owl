import { IEditorTabStore } from "@hooks/editorStore";
import { useScriptStore } from "@hooks/scriptStore";
import { Loader, Tabs } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
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
  const { scripts } = useScriptStore();
  const [title, setTitle] = useState(`Query ${index + 1}`);

  useEffect(() => {
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].id === scriptId) {
        setTitle(scripts[i].name);
        return;
      }
    }
  }, [scripts, scriptId]);

  return (
    <Tabs.Tab
      w={140}
      px={4}
      value={id}
      className="editor-tab"
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
  );
}
