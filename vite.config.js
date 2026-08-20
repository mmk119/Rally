import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves this project from https://<user>.github.io/Rally/, so the
  // built asset URLs need that prefix. Only on build: the dev server stays at "/".
  base: command === "build" ? "/Rally/" : "/",
  build: {
    rollupOptions: {
      output: {
        // Recharts (which carries React in with it) is the bulk of the bundle
        // and changes far less often than the app. Splitting it gives the
        // browser one big chunk it can keep across deploys and an app chunk
        // small enough to re-fetch on every change.
        // Listing react separately produced an empty chunk, since recharts
        // already pulls it into this one.
        manualChunks: {
          charts: ["recharts"],
        },
      },
    },
  },
}));
