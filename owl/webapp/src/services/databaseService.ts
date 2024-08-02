import {
  Database,
  DatabaseCreateOptions,
  DatabaseUpdateOptions,
  ExecuteQueryResult,
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

  export const executeQuery = async (
    id: number | string,
    query: string
  ): Promise<ExecuteQueryResult> => {
    return request
      .post(`databases/${id}/execute`, {
        query: query,
      })
      .then((response) => {
        return response.data as ExecuteQueryResult;
      });
  };
}

export default DatabaseService;
