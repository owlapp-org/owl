import { IMacroFile } from "@ts/interfaces/macrofile_interface";
import request from "src/lib/request";

namespace MacroFileService {
  export const updateContent = async (
    id: number,
    content: string
  ): Promise<IMacroFile> => {
    return request.put(`macros/${id}`, {
      content,
    });
  };
  export const fetchContent = async (id: number): Promise<string> => {
    return request.get(`macros/${id}/content`).then((response) => {
      return response.data["content"];
    });
  };
  export const upload = async (data: FormData): Promise<IMacroFile> => {
    return request
      .post("macros/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  };
  export const fetchAll = async (): Promise<IMacroFile[]> => {
    return request.get("macros").then((response) => response.data);
  };
  export const update = async (
    id: number,
    name: string
  ): Promise<IMacroFile> => {
    return request
      .put(`macros/${id}`, { name })
      .then((response) => response.data);
  };
  export const remove = async (id: number): Promise<IMacroFile> => {
    return request.delete(`macros/${id}`);
  };
  export const create = async (
    name: string,
    content?: string
  ): Promise<IMacroFile> => {
    return request
      .post("macros", { name, content })
      .then((response) => response.data);
  };
  export const download = async (id: number, name: string): Promise<void> => {
    try {
      const response = await request.get(`macros/${id}/download`, {
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

  export const renderContent = async (
    content: string,
    command?: string
  ): Promise<string> => {
    return request
      .post("macros/render", { content, command })
      .then((response) => response.data);
  };
}

export default MacroFileService;
