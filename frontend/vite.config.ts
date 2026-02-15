import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
    css: false,
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    allowedHosts: [
      "quick-star-9f0d37ad.tunnl.gg",
      ".tunnl.gg", // Allow all tunnl.gg subdomains
    ],
  },
});
