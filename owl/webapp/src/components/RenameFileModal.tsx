import { useFileStore } from "@hooks/fileStore";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { IFile } from "@ts/interfaces/file_interface";
import { FC, useEffect, useState } from "react";

interface RenameFileModalProps {
  open: boolean;
  onClose: () => void;
  file: IFile | null;
}

const RenameFileModal: FC<RenameFileModalProps> = ({ open, onClose, file }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const { renameFile } = useFileStore();

  useEffect(() => {
    if (open && file) {
      setName(file.name);
    }
  }, [open, file]);

  const resetState = () => {
    setName("");
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    try {
      setLoading(true);
      await renameFile(file.id, name || file.name);
    } catch (error) {
    } finally {
      setLoading(false);
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
          <Button type="button" onClick={handleSubmit} loading={loading}>
            Update
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default RenameFileModal;
