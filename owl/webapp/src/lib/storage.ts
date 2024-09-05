// todo remove this
// export interface User {
//   access_token: string;
//   email: string;
//   name: string;
// }

export namespace AppStorage {
  export function getAccessToken() {
    let access_token = sessionStorage.getItem("access_token");
    if (!access_token) {
      access_token = localStorage.getItem("access_token");
    }
    return access_token;
  }
  export function setAccessToken(access_token: string, rememberMe: boolean) {
    sessionStorage.setItem("access_token", access_token);
    if (rememberMe) {
      localStorage.setItem("access_token", access_token);
    }
  }
  export function removeAccessToken() {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
  }
}
