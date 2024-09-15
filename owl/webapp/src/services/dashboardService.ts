import { IDashboardFile } from "@ts/interfaces/dashboard_interface";
import request from "src/lib/request";

namespace DashboardService {
  export const updateContent = async (
    id: number,
    content: string
  ): Promise<IDashboardFile> => {
    return request.put(`dashboards/${id}`, {
      content,
    });
  };
  export const fetchContent = async (id: number): Promise<string> => {
    return request.get(`dashboards/${id}/content`).then((response) => {
      return response.data["content"];
    });
  };
  export const upload = async (data: FormData): Promise<IDashboardFile> => {
    return request
      .post("dashboards/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  };
  export const fetchAll = async (): Promise<IDashboardFile[]> => {
    return request.get("dashboards").then((response) => response.data);
  };
  export const update = async (
    id: number,
    name: string
  ): Promise<IDashboardFile> => {
    return request
      .put(`dashboards/${id}`, { name })
      .then((response) => response.data);
  };
  export const remove = async (id: number): Promise<IDashboardFile> => {
    return request.delete(`dashboards/${id}`);
  };
  export const create = async (
    name: string,
    content?: string
  ): Promise<IDashboardFile> => {
    return request
      .post("dashboards", { name, content })
      .then((response) => response.data);
  };
  export const download = async (id: number, name: string): Promise<void> => {
    try {
      const response = await request.get(`dashboards/${id}/download`, {
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
      .post("dashboards/render", { content, command })
      .then((response) => response.data);
  };
}

export default DashboardService;
