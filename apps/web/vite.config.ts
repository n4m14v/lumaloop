import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) {
            return "react-vendor";
          }

          if (
            id.includes("/node_modules/three/") ||
            id.includes("/node_modules/@react-three/fiber/") ||
            id.includes("/node_modules/@react-three/drei/")
          ) {
            return "render-vendor";
          }

          if (
            id.includes("/node_modules/gsap/") ||
            id.includes("/node_modules/lucide-react/") ||
            id.includes("/node_modules/@dnd-kit/")
          ) {
            return "ui-vendor";
          }

          if (
            id.includes("/packages/engine/src/") ||
            id.includes("/packages/level-data/src/") ||
            id.includes("/packages/level-schema/src/")
          ) {
            return "game-data";
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@lumaloop/engine": new URL("../../packages/engine/src/index.ts", import.meta.url).pathname,
      "@lumaloop/level-data": new URL("../../packages/level-data/src/index.ts", import.meta.url).pathname,
      "@lumaloop/level-schema": new URL("../../packages/level-schema/src/index.ts", import.meta.url).pathname,
    },
  },
});
