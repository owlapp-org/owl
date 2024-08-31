import { IUser } from "./user_interface";

export interface IDatabaseCreateOptions {
  name: string;
  pool_size?: number;
  description?: string;
}

export interface IDatabaseUpdateOptions {
  name: string;
  pool_size?: number;
  description?: string;
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
}
