import useEditorStore from "@hooks/editorStore";
import useMacroFileStore from "@hooks/macrofileStore";
import useScriptStore from "@hooks/scriptStore";
import { Button, Group, Modal, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import { IMacroFile } from "@ts/interfaces/macrofile_interface";
import { IScript } from "@ts/interfaces/script_interface";
import { FC, useEffect, useState } from "react";
import { useCreateFileModalStore } from "./useCreateFileModalStore";

const CreateFileModal: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const { tabId, open, fileType, destroy } = useCreateFileModalStore();
  const { create: createScript } = useScriptStore();
  const { create: createMacroFile } = useMacroFileStore();
  const { findTabById } = useEditorStore();

  const resetAndDestroy = () => {
    setName("");
    destroy();
  };

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  const handleCreateScriptFile = async (): Promise<IScript | undefined> => {
    if (!name.endsWith(".sql")) {
      notifications.show({
        title: "Warning",
        message: "Only 'sql' file extension is allowed.",
        color: "yellow",
      });
      return;
    }
    return await createScript(name);
  };

  const handleCreateMacroFile = async (): Promise<IMacroFile | undefined> => {
    if (!(name.endsWith(".j2") || name.endsWith(".jinja"))) {
      notifications.show({
        title: "Warning",
        message: "Only ('j2', 'jinja') file extensions are allowed.",
        color: "yellow",
      });
      return;
    }
    return await createMacroFile(name);
  };

  const setTabFile = (file: IScript | IMacroFile) => {
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
      switch (fileType) {
        case FileType.ScriptFile: {
          file = await handleCreateScriptFile();
          break;
        }
        case FileType.MacroFile: {
          file = await handleCreateMacroFile();
          break;
        }
      }
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
