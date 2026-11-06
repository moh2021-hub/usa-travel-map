import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The map files are big on purpose; this stops Vite warning about them on every build.
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    // In development the browser calls /api on this server and Vite forwards it
    // to Spring Boot, so there are no cross-origin problems to deal with.
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
