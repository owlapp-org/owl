import { IUser } from "./user_interface";

export interface IDashboardFile {
  id: number;
  path: string;
  owner: IUser;
  name: string;
  extension: string;
  content?: string;
  renderedContent?: string;
}
