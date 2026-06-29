import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        detail: resolve(__dirname, "todo.html")
      }
    }
  }
});
