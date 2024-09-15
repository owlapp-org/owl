import request from "@lib/request";
import { IMacroFile } from "@ts/interfaces/interfaces";
import { IScript } from "@ts/interfaces/script_interface";

export default class ApiService<T> {
  protected domain: string;
  constructor(domain: string) {
    this.domain = domain;
  }
  async create(payload: Record<string, any>): Promise<T> {
    return request.post(this.domain, payload).then((response) => response.data);
  }
  async fetchAll(): Promise<T[]> {
    return request.get(this.domain).then((response) => response.data);
  }
  async update(id: number, payload: Record<string, any>): Promise<T> {
    return request
      .put(`${this.domain}/${id}`, payload)
      .then((response) => response.data);
  }
  async remove(id: number): Promise<T> {
    return request
      .delete(`${this.domain}/${id}`)
      .then((response) => response.data);
  }
  async findById(id: number): Promise<T> {
    return request
      .get(`${this.domain}/${id}`)
      .then((response) => response.data);
  }
}

export class FileService<T> extends ApiService<T> {
  constructor(domain: string) {
    super(domain);
  }
  async updateContent(id: number, content: string): Promise<T> {
    return request
      .put(`${this.domain}/${id}`, {
        content,
      })
      .then((response) => response.data);
  }
  async fetchContent(id: number): Promise<string> {
    return request.get(`${this.domain}/${id}/content`).then((response) => {
      return response.data["content"];
    });
  }
  async upload(data: FormData): Promise<T> {
    return request
      .post(`${this.domain}/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  }
  async download(id: number, name: string): Promise<void> {
    try {
      const response = await request.get(`${this.domain}/${id}/download`, {
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
  }
}

export const macroFileService = new FileService<IMacroFile>("macros");
export const scriptService = new FileService<IScript>("scripts");
