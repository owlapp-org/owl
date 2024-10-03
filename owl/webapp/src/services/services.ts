import request from "@lib/request";
import { IDatabase, IMacroFile, IQueryResult } from "@ts/interfaces/interfaces";
import { IScript } from "@ts/interfaces/interfaces";

// ApiService class for basic CRUD operations
export class ApiService<T> {
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

// Uploader class with upload functionality
class Uploader {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  upload(data: FormData): Promise<any> {
    return request
      .post(`${this.domain}/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => response.data);
  }
}
// Downloader class with download functionality
class Downloader {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  async download(id: number, name: string): Promise<void> {
    try {
      const response = await request.get(`${this.domain}/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
      throw error;
    }
  }
}

export class FileService<T> extends ApiService<T> {
  private uploader: Uploader;
  private downloader: Downloader;

  constructor(domain: string) {
    super(domain);
    this.uploader = new Uploader(domain);
    this.downloader = new Downloader(domain);
  }
  async updateContent(id: number, content: string): Promise<T> {
    return request.put(`${this.domain}/${id}`, {
      content,
    });
  }
  async fetchContent(id: number): Promise<string> {
    return request.get(`${this.domain}/${id}/content`).then((response) => {
      return response.data["content"];
    });
  }
  // Expose upload method from Uploader
  upload(data: FormData): Promise<any> {
    return this.uploader.upload(data);
  }
  // Expose download method from Downloader
  download(id: number, name: string): Promise<void> {
    return this.downloader.download(id, name);
  }
}

export class MacroFileService<T> extends FileService<T> {
  constructor(domain: string) {
    super(domain);
  }
  async renderContent(content: string, command?: string): Promise<string> {
    return request
      .post(`${this.domain}/render`, { content, command })
      .then((response) => response.data);
  }
}

export class DashboardService<T> extends MacroFileService<T> {
  constructor(domain: string) {
    super(domain);
  }
}

export class DatabaseService<T> extends ApiService<T> {
  private uploader: Uploader;
  private downloader: Downloader;

  constructor(domain: string) {
    super(domain);
    this.uploader = new Uploader(domain);
    this.downloader = new Downloader(domain);
  }
  async upload(data: FormData): Promise<T> {
    return this.uploader.upload(data);
  }
  async download(id: number, name: string): Promise<void> {
    return this.downloader.download(id, name);
  }
  async run(
    database_id: number | string | null | undefined,
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count: boolean = true
  ): Promise<IQueryResult> {
    return request
      .post(
        `${this.domain}/run`,
        {
          query,
        },
        {
          params: { start_row, end_row, with_total_count, database_id },
        }
      )
      .then((response) => response.data);
  }
  async exportData(
    id: number | undefined,
    query: string | undefined,
    filename: string,
    file_type: string,
    options: Record<string, any>
  ) {
    try {
      const response = await request.post(
        `${this.domain}/${id}/export`,
        {
          query,
          filename,
          file_type,
          options,
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }
}

// Instantiate services
export const scriptService = new FileService<IScript>("scripts");
export const dataFileService = new FileService<IScript>("files");
export const macroFileService = new MacroFileService<IMacroFile>("macros");
export const databaseService = new DatabaseService<IDatabase>("databases");
