import { useDatabaseStore } from "@hooks/useDatabaseStore";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Database } from "@ts/interfaces/database_interface";
import { FC, useState } from "react";

interface CreateDatabaseModalProps {
  open: boolean;
  onClose: () => void;
  onDatabaseCreated?: (database: Database) => void;
}

const CreateDatabaseModal: FC<CreateDatabaseModalProps> = ({
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const { createDatabase } = useDatabaseStore();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      poolSize: 1,
    },
  });

  const resetState = () => {
    form.reset();
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      createDatabase({
        name: values.name,
        pool_size: values.poolSize,
        description: values.description,
      });
    } catch (error) {
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Create Database">
      <form
        onSubmit={form.onSubmit((values) => handleSubmit(values))}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <TextInput
          label="Database Name"
          placeholder="Enter database name"
          {...form.getInputProps("name")}
          required
        />
        <NumberInput
          label="Pool Size"
          placeholder="Enter pool size"
          min={1}
          {...form.getInputProps("poolSize")}
          required
        />
        <Textarea
          label="Description"
          placeholder="Enter description"
          {...form.getInputProps("description")}
          minRows={4}
        />
        <Group mt="md" justify="end">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateDatabaseModal;
