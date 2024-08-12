import { IFile } from "@ts/interfaces/file_interface";
import request from "src/lib/request";

namespace FileService {
  export const upload = async (data: FormData): Promise<IFile> => {
    return request
      .post("files/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data as IFile);
  };
  export const list = async (): Promise<IFile[]> => {
    return request.get("files").then((response) => response.data as IFile[]);
  };
  export const rename = async (id: number, name: string): Promise<IFile> => {
    return request
      .put(`files/${id}/rename`, { name })
      .then((response) => response.data as IFile);
  };
  export const del = async (id: number): Promise<IFile> => {
    return request.delete(`files/${id}`);
  };
}

export default FileService;
