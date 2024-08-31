import { IUser } from "./user_interface";

export interface IDataFile {
  id: number;
  path: string;
  owner: IUser;
  name: string;
  extension: string;
}
