import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";

export namespace FileExtensions {
  export const getBy = (fileType: FileType): string[] => {
    switch (fileType) {
      case FileType.ScriptFile:
        return ["sql"];
      case FileType.MacroFile:
        return ["j2", "jinja"];
    }
    return [];
  };
  export const isValid = (filename: string, fileType: FileType) => {
    return FileExtensions.getBy(fileType).some((ext) => filename.endsWith(ext));
  };
  export const validate = (
    filename: string,
    fileType: FileType | null,
    notify: boolean = true
  ): boolean => {
    if (notify && !fileType) {
      notifications.show({
        title: "Error",
        message: "Unknown file type",
        color: "red",
      });
      return false;
    }
    if (!fileType) {
      notifications.show({
        title: "Error",
        message: "Unknown file type",
        color: "red",
      });
      return false;
    }
    if (FileExtensions.isValid(filename, fileType)) {
      return true;
    } else {
      notifications.show({
        title: "Error",
        message:
          "File type is not supported. Valid file types are: " +
          FileExtensions.getBy(fileType!).join(", "),
        color: "red",
      });
      return false;
    }
  };
}
