import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { compression } from "vite-plugin-compression"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
    mode === "analyze" &&
      visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["jszip", "papaparse"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}))
