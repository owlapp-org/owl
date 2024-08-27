import useDatabaseStore from "@hooks/databaseStore";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IDatabase } from "@ts/interfaces/database_interface";
import { FC, useEffect, useState } from "react";

interface UpdateDatabaseModalProps {
  open: boolean;
  onClose: () => void;
  database: IDatabase | null;
}

const UpdateDatabaseModal: FC<UpdateDatabaseModalProps> = ({
  open,
  onClose,
  database,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [poolSize, setPoolSize] = useState(1);
  const { update } = useDatabaseStore();

  useEffect(() => {
    if (open && database) {
      setName(database.name);
      setDescription(database.description as string);
      setPoolSize(database.pool_size);
    }
  }, [open, database]);

  const resetState = () => {
    setName("");
    setDescription("");
    setPoolSize(1);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!database) return;

    setIsLoading(true);
    try {
      await update(database.id, {
        ...database,
        name: name,
        description: description,
        pool_size: poolSize,
      });
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Update Database">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TextInput
          label="Database Name"
          placeholder="Enter database name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <NumberInput
          label="Pool Size"
          placeholder="Enter pool size"
          min={1}
          value={poolSize}
          onChange={(value) => {
            console.log(value);
            setPoolSize(Number.parseInt(value as string) || 1);
          }}
          required
        />
        <Textarea
          label="Description"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={4}
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

export default UpdateDatabaseModal;
