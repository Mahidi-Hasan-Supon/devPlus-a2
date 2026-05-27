import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],

  format: ["cjs"],

  platform: "node",

  target: "node20",

  outDir: "dist",

  clean: true,

  bundle: true,

  splitting: false,

  sourcemap: true,
});