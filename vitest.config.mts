import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      // The real package throws unconditionally on plain import; Next's
      // bundler swaps it for a no-op in server compilation, Vitest needs
      // the same treatment to load server-only modules under test.
      "server-only": path.resolve(import.meta.dirname, "test/stubs/server-only.ts"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
