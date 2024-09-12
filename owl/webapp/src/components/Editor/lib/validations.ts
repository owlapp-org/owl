import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";

export const validateFileName = (
  name: string,
  fileType: FileType | null,
  notify: boolean = true
): boolean => {
  switch (fileType) {
    case FileType.ScriptFile: {
      if (!name.endsWith(".sql")) {
        notify &&
          notifications.show({
            title: "Warning",
            message: "Only 'sql' file extension is allowed.",
            color: "yellow",
          });
        return false;
      }
      return true;
    }
    case FileType.MacroFile: {
      if (!name.endsWith(".j2") && !name.endsWith(".jinja")) {
        notify &&
          notifications.show({
            title: "Warning",
            message: "Only 'j2'and 'jinja' file extensions are allowed.",
            color: "yellow",
          });
        return false;
      }
      return true;
    }
    default: {
      notify &&
        notifications.show({
          title: "Error",
          message: "Unknown file type",
          color: "red",
        });
      return false;
    }
  }
};
