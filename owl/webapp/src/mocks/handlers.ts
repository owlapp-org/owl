import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/app/config", () => {
    return HttpResponse.json({ production: true, google_login: true });
  }),
];
