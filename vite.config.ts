import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    // Enables the dev-only logger. In production, esbuild.drop removes all console.*
    __LOGGER_DEV__: JSON.stringify(mode === "development"),
  },
  esbuild: {
    // Strip all console.* and debugger statements from production builds
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("react/")) {
              return "react-vendor";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs")) {
              return "chart-vendor";
            }
            if (id.includes("zod")) return "zod-vendor";
          }
        },
      },
    },
  },
}));
