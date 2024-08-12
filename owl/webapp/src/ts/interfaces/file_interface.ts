import { User } from "./user_interface";

export interface IFile {
  id: number;
  path: string;
  owner: User;
  name: string;
  extension: string;
}
