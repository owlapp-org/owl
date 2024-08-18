import {
  Database,
  DatabaseCreateOptions,
  DatabaseUpdateOptions,
  ExecuteQueryResult,
  QueryResult,
} from "@ts/interfaces/database_interface";
import request from "src/lib/request";

namespace DatabaseService {
  export const create = async (
    params: DatabaseCreateOptions
  ): Promise<Database> => {
    return request
      .post("databases", params)
      .then((response) => response.data as Database);
  };

  export const update = async (
    id: number,
    params: DatabaseUpdateOptions
  ): Promise<Database> => {
    return request
      .put(`databases/${id}`, params)
      .then((response) => response.data as Database);
  };

  export const list = async (): Promise<Array<Database>> => {
    return request
      .get("databases")
      .then((response) => response.data as Array<Database>);
  };

  export const del = async (id: number): Promise<Database> => {
    return request.delete(`databases/${id}`);
  };

  export const run = async (
    id: number | string,
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count: boolean = true
  ): Promise<QueryResult> => {
    return request
      .post(
        `databases/${id}/run`,
        {
          query: query,
        },
        {
          params: { start_row, end_row, with_total_count },
        }
      )
      .then((response) => {
        return response.data as QueryResult;
      });
  };
}

export default DatabaseService;
