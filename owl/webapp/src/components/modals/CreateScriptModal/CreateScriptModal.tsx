import useScriptStore from "@hooks/scriptStore";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FC, useState } from "react";
import { useCreateScriptModalStore } from "./useCreateScriptModalStore";

const CreateScriptModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const { open, destroy } = useCreateScriptModalStore();
  const { create } = useScriptStore();

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
      await create(name);
    } catch (error) {
    } finally {
      setIsLoading(false);
      destroy();
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
