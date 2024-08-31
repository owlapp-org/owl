import {
  IDatabase,
  IDatabaseCreateOptions,
  IDatabaseUpdateOptions,
  IQueryResult,
} from "@ts/interfaces/database_interface";
import request from "src/lib/request";

namespace DatabaseService {
  export const create = async (
    params: IDatabaseCreateOptions
  ): Promise<IDatabase> => {
    return request.post("databases", params).then((response) => response.data);
  };

  export const update = async (
    id: number,
    params: IDatabaseUpdateOptions
  ): Promise<IDatabase> => {
    return request
      .put(`databases/${id}`, params)
      .then((response) => response.data);
  };

  export const fetchAll = async (): Promise<IDatabase[]> => {
    return request.get("databases").then((response) => response.data);
  };

  export const remove = async (id: number): Promise<IDatabase> =>
    request.delete(`databases/${id}`);

  export const run = async (
    id: number | string | null | undefined,
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count: boolean = true
  ): Promise<IQueryResult> => {
    const url = id == null ? "databases/run" : `databases/${id}/run`;
    return request
      .post(
        url,
        {
          query,
        },
        {
          params: { start_row, end_row, with_total_count },
        }
      )
      .then((response) => response.data);
  };
}

export default DatabaseService;
