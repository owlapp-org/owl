import { IAppConfig } from "@ts/interfaces/app_interface";
import request from "src/lib/request";

export namespace AppService {
  export const getConfig = async (): Promise<IAppConfig> => {
    return request.get("app/config").then((response) => response.data);
  };
}
