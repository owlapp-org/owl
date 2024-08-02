import { User } from "./user_interface";

export interface DatabaseCreateOptions {
  name: string;
  pool_size?: number;
  description?: string;
}

export interface DatabaseUpdateOptions {
  name: string;
  pool_size?: number;
  description?: string;
}

export interface Database {
  id: number;
  name: string;
  pool_size: number;
  owner?: User;
  description?: string;
}

export interface ExecuteQueryResult {
  statement_type: string;
  data?: Record<string, any>[];
  columns?: string[];
  affected_rows?: number;
}
