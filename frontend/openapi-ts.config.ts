import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi.json",
  output: "./src/client",

  plugins: [
    { name: "@hey-api/client-fetch", throwOnError: true },
    { name: "@hey-api/typescript", case: "preserve" },
    "@hey-api/sdk",
  ],
});
