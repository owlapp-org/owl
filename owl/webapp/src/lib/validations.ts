import { notifications } from "@mantine/notifications";
import { FileType } from "@ts/enums/filetype_enum";
import { notify } from "./notify";

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
    showNotification: boolean = true
  ): boolean => {
    if (showNotification && !fileType) {
      notify.error("Unknown file type");
      return false;
    }
    if (!fileType) {
      notify.error("Unknown file type");
      return false;
    }
    if (FileExtensions.isValid(filename, fileType)) {
      return true;
    } else {
      notify.error(
        "File type is not supported. Valid file types are: " +
          FileExtensions.getBy(fileType!).join(", ")
      );
      return false;
    }
  };
}
