import { IScript } from "@ts/interfaces/script_interface";
import request from "src/lib/request";

namespace ScriptService {
  export const updateContent = async (
    id: number,
    content: string
  ): Promise<IScript> => {
    return request.put(`scripts/${id}`, {
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
  export const download = async (id: number, name: string): Promise<void> => {
    try {
      const response = await request.get(`scripts/${id}/download`, {
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

export default ScriptService;
