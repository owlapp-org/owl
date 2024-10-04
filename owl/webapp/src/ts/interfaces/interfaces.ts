import { FileType } from "@ts/enums";

export interface IUser {
  id: number;
  name: string;
  email: string;
}

export interface ILoginResponse {
  name: string;
  email: string;
  access_token: string;
}

export interface IAppConfig {
  google_login: boolean;
  production: boolean;
}

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
  query_id?: string;
}

export default interface IFile {
  id?: number | null;
  name?: string;
  fileType?: FileType;
}

export interface IFileModel {
  id: number;
  path: string;
  owner: IUser;
  name: string;
  extension: string;
}

export interface IMacroFile extends IFileModel {}
export interface IScript extends IFileModel {}
export interface IDataFile extends IFileModel {}
