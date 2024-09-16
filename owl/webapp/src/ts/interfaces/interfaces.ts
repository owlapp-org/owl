import { FileType } from "@ts/enums/filetype_enum";
import { IUser } from "./user_interface";

export interface IDatabase {
  id: number;
  name: string;
  pool_size: number;
  owner?: IUser;
  description?: string;
}

export interface IQueryResult {
  database_id: number;
  query: string;
  statement_type: string;
  data?: Record<string, any>[];
  columns?: string[];
  affected_rows?: number;
  total_count?: number;
  start_row?: number;
  end_row?: number;
}

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
