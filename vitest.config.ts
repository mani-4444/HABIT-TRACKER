import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use separate projects so api/ tests get node env (no window/jsdom overhead)
    // while src/ tests keep jsdom + the browser setup file.
    projects: [
      {
        test: {
          name: "src",
          globals: true,
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },
        resolve: {
          alias: { "@": path.resolve(__dirname, "./src") },
        },
      },
      {
        test: {
          name: "api",
          globals: true,
          environment: "node",
          include: ["api/**/*.{test,spec}.ts"],
        },
        resolve: {
          alias: { "@": path.resolve(__dirname, "./src") },
        },
      },
    ],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
