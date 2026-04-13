import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project URL: https://<user>.github.io/<repo>/
// CI sets GITHUB_ACTIONS + GITHUB_REPOSITORY automatically.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS === "true" && repo ? `/${repo}/` : "/");

export default defineConfig({
  base,
  plugins: [react()],
});
