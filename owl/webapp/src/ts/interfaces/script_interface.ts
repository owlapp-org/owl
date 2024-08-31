import { IUser } from "./user_interface";

export interface IScript {
  id: number;
  path: string;
  owner: IUser;
  name: string;
  extension: string;
}
