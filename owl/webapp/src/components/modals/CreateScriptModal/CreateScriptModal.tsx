import useEditorStore from "@hooks/editorStore";
import useScriptStore from "@hooks/scriptStore";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import { FC, useEffect, useState } from "react";
import { useCreateScriptModalStore } from "./useCreateScriptModalStore";

const CreateScriptModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const { tabId, open, destroy } = useCreateScriptModalStore();
  const { create } = useScriptStore();
  const { findTabById } = useEditorStore();

  const resetAndDestroy = () => {
    setName("");
    destroy();
  };

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name.endsWith(".sql")) {
      notifications.show({
        title: "Warning",
        message: "Only 'sql' file extension is allowed.",
        color: "yellow",
      });
      return;
    }
    setIsLoading(true);
    try {
      setIsLoading(true);
      const script = await create(name);
      if (tabId) {
        const tabStore = findTabById(tabId);
        if (tabStore) {
          tabStore?.getState().setFile({
            id: script.id,
            name: script.name,
            fileType: FileType.ScriptFile,
          });
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      resetAndDestroy();
    }
  };

  return (
    <Modal opened={open} onClose={destroy} title="New Script">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextInput
          label="File Name"
          placeholder="Enter file name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Group mt="md" justify="right">
          <Button variant="default" onClick={destroy}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!name}
            onClick={handleSubmit}
            loading={isLoading}
          >
            Create
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default CreateScriptModal;
