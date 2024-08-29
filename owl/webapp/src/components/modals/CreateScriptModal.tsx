import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FC, useState } from "react";

interface ICreateScriptModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateScriptModal: FC<ICreateScriptModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");

  const resetState = () => {
    setName("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

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
      await onCreate(name);
    } catch (error) {
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="New Script">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextInput
          label="File Name"
          placeholder="Enter file name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Group mt="md" justify="right">
          <Button variant="default" onClick={handleClose}>
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
