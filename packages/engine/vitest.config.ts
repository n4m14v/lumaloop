import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@lumaloop/level-schema": new URL("../level-schema/src/index.ts", import.meta.url).pathname,
    },
  },
});
