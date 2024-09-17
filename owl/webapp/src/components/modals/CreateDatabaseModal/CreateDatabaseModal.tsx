import { useDatabaseStore } from "@hooks/hooks";
import {
  Button,
  Group,
  Modal,
  NumberInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useState } from "react";
import { useCreateDatabaseModalStore } from "./useCreateDatabaseModalStore";

const CreateDatabaseModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { open, destroy } = useCreateDatabaseModalStore();
  const { create } = useDatabaseStore();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      poolSize: 1,
    },
  });

  const handleClose = () => {
    form.reset();
    setIsLoading(false);
    destroy();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      await create({
        name: values.name,
        pool_size: values.poolSize,
        description: values.description,
      });
    } finally {
      setIsLoading(false);
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
          <Button type="submit" loading={isLoading}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateDatabaseModal;
