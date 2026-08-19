import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves this project from https://<user>.github.io/Rally/, so the
  // built asset URLs need that prefix. Only on build: the dev server stays at "/".
  base: command === "build" ? "/Rally/" : "/",
}));
