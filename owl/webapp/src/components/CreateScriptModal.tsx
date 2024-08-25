import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FC, useState } from "react";

interface CreateScriptModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const CreateScriptModal: FC<CreateScriptModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const resetState = () => {
    setName("");
    setLoading(false);
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
    setLoading(true);
    try {
      setLoading(true);
      await onCreate(name);
    } catch (error) {
    } finally {
      setLoading(false);
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
            loading={loading}
          >
            Create
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default CreateScriptModal;
