import { IDataFile } from "@ts/interfaces/datafile_interface";
import request from "src/lib/request";

namespace DataFileService {
  export const upload = async (data: FormData): Promise<IDataFile> => {
    return request
      .post("files/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  };
  export const fetchAll = async (): Promise<IDataFile[]> =>
    request.get("files").then((response) => response.data);

  export const rename = async (
    id: number,
    name: string
  ): Promise<IDataFile> => {
    return request
      .put(`files/${id}/rename`, { name })
      .then((response) => response.data);
  };
  export const remove = async (id: number): Promise<IDataFile> => {
    return request.delete(`files/${id}`);
  };
}

export default DataFileService;
