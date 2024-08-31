import { FileType } from "@ts/enums/filetype_enum";

export default interface IFile {
  id?: number;
  name?: string;
  fileType?: FileType;
}
