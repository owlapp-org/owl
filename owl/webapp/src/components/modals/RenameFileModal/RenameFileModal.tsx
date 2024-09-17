import {
  useDataFileStore,
  useMacroFileStore,
  useScriptStore,
} from "@hooks/hooks";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import { FC, useEffect, useState } from "react";
import { useRenameFileModalStore } from "./useRenameFileModalStore";

const RenameFileModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const { file, open, destroy } = useRenameFileModalStore();
  const { rename: renameDataFile } = useDataFileStore();
  const { rename: renameScript } = useScriptStore();
  const { rename: renameMacroFile } = useMacroFileStore();

  useEffect(() => {
    open && file && setName(file.name || "");
  }, [open, file?.name]);

  const handleRename = async () => {
    if (!file.id) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "File not saved.",
      });
      return;
    }
    switch (file.fileType) {
      case FileType.ScriptFile: {
        return renameScript(file.id, name);
      }
      case FileType.DataFile: {
        return renameDataFile(file.id, name);
      }
      case FileType.MacroFile: {
        return renameMacroFile(file.id, name);
      }
      default: {
        notifications.show({
          color: "red",
          title: "Error",
          message: "File type not supported",
        });
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true);
      await handleRename();
    } finally {
      setIsLoading(false);
      destroy();
    }
  };

  return (
    <Modal opened={open} onClose={destroy} title="Update File">
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
          <Button type="button" onClick={handleSubmit} loading={isLoading}>
            Update
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default RenameFileModal;
