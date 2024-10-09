import useEditorStore from "@hooks/editorStore";
import { FileExtensions } from "@lib/validations";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import IFile, { IScript } from "@ts/interfaces/interfaces";
import { FC, useEffect, useState } from "react";
import { useCreateFileModalStore } from "./useCreateFileModalStore";

const CreateFileModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const { tabId, open, fileType, onSave, destroy } = useCreateFileModalStore();
  const { findTabById } = useEditorStore();

  const resetAndDestroy = () => {
    setName("");
    destroy();
  };

  useEffect(() => {
    open && setName("");
  }, [open]);

  const handleCreateFile = async () => {
    try {
      setIsLoading(true);
      FileExtensions.validate(name, fileType);
      await onSave(name);
    } finally {
      setIsLoading(false);
    }
  };

  const setTabFile = (file: IFile) => {
    if (tabId) {
      const tabStore = findTabById(tabId);
      if (tabStore) {
        tabStore?.getState().setFile({
          id: file.id,
          name: file.name,
          fileType: fileType!,
        });
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let file: IScript | undefined = undefined;
    try {
      handleCreateFile();
      file && fileType && setTabFile(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      resetAndDestroy();
    }
  };

  return (
    <Modal opened={open} onClose={destroy} title="New File">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextInput
          label="File Name"
          placeholder="Enter file name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.code == "Enter" && handleSubmit()}
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

export default CreateFileModal;
