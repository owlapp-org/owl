import { IScript } from "@ts/interfaces/script_interface";
import request from "src/lib/request";

namespace ScriptService {
  export const updateContent = async (
    id: number,
    content: string
  ): Promise<IScript> => {
    return request.put(`scripts/${id}/content`, {
      content,
    });
  };
  export const fetchContent = async (id: number): Promise<string> => {
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
      .then((response) => response.data);
  };
  export const fetchAll = async (): Promise<IScript[]> => {
    return request.get("scripts").then((response) => response.data);
  };
  export const rename = async (id: number, name: string): Promise<IScript> => {
    return request
      .put(`scripts/${id}/rename`, { name })
      .then((response) => response.data);
  };
  export const remove = async (id: number): Promise<IScript> => {
    return request.delete(`scripts/${id}`);
  };
  export const create = async (
    name: string,
    content?: string
  ): Promise<IScript> => {
    return request
      .post("scripts", { name, content })
      .then((response) => response.data);
  };
}

export default ScriptService;
