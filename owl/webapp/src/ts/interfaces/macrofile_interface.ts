import { IUser } from "./user_interface";

export interface IMacroFile {
  id: number;
  path: string;
  owner: IUser;
  name: string;
  extension: string;
}
