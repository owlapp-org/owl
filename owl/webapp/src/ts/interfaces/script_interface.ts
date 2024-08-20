import { User } from "./user_interface";

export interface IScript {
  id: number;
  path: string;
  owner: User;
  name: string;
  extension: string;
}
