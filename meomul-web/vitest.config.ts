import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    // Was "node", which meant nothing touching localStorage, the DOM, or a React
    // component could be tested at all — the reason 189 source files had zero component
    // coverage. jsdom is the default now; the pure-logic suites are unaffected by it.
    environment: "jsdom",
    // jsdom only provides a working localStorage on a real origin — with the default
    // about:blank it is an opaque origin and storage access fails.
    environmentOptions: {
      jsdom: { url: "http://localhost:3000" },
    },
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
});
