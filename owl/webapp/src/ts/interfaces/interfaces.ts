import { FileType } from "@ts/enums/filetype_enum";
import { IUser } from "./user_interface";

export default interface IFile {
  id?: number | null;
  name?: string;
  fileType?: FileType;
}

export interface IMacroFile {
  id: number;
  path: string;
  owner: IUser;
  name: string;
  extension: string;
}
