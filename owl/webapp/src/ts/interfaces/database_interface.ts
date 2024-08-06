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

// depreciated
export interface ExecuteQueryResult {
  statement_type: string;
  data?: Record<string, any>[];
  columns?: string[];
  affected_rows?: number;
  total_count?: number;
  total_pages?: number;
  current_page?: number;
  page_size?: number;
}

export interface QueryResult {
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
