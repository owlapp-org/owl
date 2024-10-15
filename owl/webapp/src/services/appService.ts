import { IAppAbout, IAppConfig } from "@ts/interfaces/interfaces";
import request from "src/lib/request";

export namespace AppService {
  export const getConfig = async (): Promise<IAppConfig> => {
    return request.get("app/config").then((response) => response.data);
  };
  export const getAbout = async (): Promise<IAppAbout> => {
    return request.get("app/about").then((response) => response.data);
  };
}
