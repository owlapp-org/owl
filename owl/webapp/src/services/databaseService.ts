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
    database_id: number | string | null | undefined,
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count: boolean = true
  ): Promise<IQueryResult> => {
    return request
      .post(
        "databases/run",
        {
          query,
        },
        {
          params: { start_row, end_row, with_total_count, database_id },
        }
      )
      .then((response) => response.data);
  };
  export const download = async (id: number, name: string): Promise<void> => {
    try {
      const response = await request.get(`databases/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${name}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
      throw error;
    }
  };
}

export default DatabaseService;
