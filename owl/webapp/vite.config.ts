import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 3000,
      host: "127.0.0.1",
      cors: true,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on("proxyReq", (proxyReq, req, res) => {
              Object.keys(req.headers).forEach((key) => {
                proxyReq.setHeader(key, req.headers[key]);
              });
            });
          },
        },
      },
    },
    optimizeDeps: {
      include: ["@emotion/react", "@emotion/styled"],
      force: true,
    },
    base: isProduction ? "/ui/static/" : "/",
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
    },
  };
});
