import { Button, Group, Modal, TextInput } from "@mantine/core";
import { IDataFile } from "@ts/interfaces/datafile_interface";
import { IScript } from "@ts/interfaces/script_interface";
import { FC, useEffect, useState } from "react";

interface IRenameFileModalProps {
  open: boolean;
  file: IDataFile | IScript;
  onClose: () => void;
  onRename: (id: number, newName: string) => void;
}

const RenameFileModal: FC<IRenameFileModalProps> = ({
  open,
  onClose,
  file,
  onRename,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (open && file) {
      setName(file.name);
    }
  }, [open, file]);

  const resetState = () => {
    setName("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      setIsLoading(true);
      await onRename(file.id, name || file.name);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Update File">
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
          <Button type="button" onClick={handleSubmit} loading={isLoading}>
            Update
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default RenameFileModal;
