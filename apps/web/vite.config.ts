import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@lumaloop/engine": new URL("../../packages/engine/src/index.ts", import.meta.url).pathname,
      "@lumaloop/level-data": new URL("../../packages/level-data/src/index.ts", import.meta.url).pathname,
      "@lumaloop/level-schema": new URL("../../packages/level-schema/src/index.ts", import.meta.url).pathname,
    },
  },
});
