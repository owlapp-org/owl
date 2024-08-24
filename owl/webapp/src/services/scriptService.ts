import { IFile } from "@ts/interfaces/file_interface";
import { IScript } from "@ts/interfaces/script_interface";
import request from "src/lib/request";

namespace ScriptService {
  export const getScriptContent = async (id: number): Promise<string> => {
    return request.get(`scripts/${id}/content`).then((response) => {
      return response.data["content"];
    });
  };
  export const upload = async (data: FormData): Promise<IScript> => {
    return request
      .post("scripts/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data as IScript);
  };
  export const list = async (): Promise<IScript[]> => {
    return request
      .get("scripts")
      .then((response) => response.data as IScript[]);
  };
  export const rename = async (id: number, name: string): Promise<IScript> => {
    return request
      .put(`scripts/${id}/rename`, { name })
      .then((response) => response.data);
  };
  export const del = async (id: number): Promise<IScript> => {
    return request.delete(`scripts/${id}`);
  };
  export const create = async (name: string): Promise<IScript> => {
    return request.post("scripts", { name }).then((response) => response.data);
  };
}

export default ScriptService;
