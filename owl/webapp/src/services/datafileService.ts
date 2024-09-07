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
  export const download = async (id: number, name: string): Promise<void> => {
    try {
      const response = await request.get(`files/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${name}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
      throw error;
    }
  };
}

export default DataFileService;
