import { defineConfig } from "@hey-api/openapi-ts";

const generatedOutput =
  process.env.DIFY_AGENT_GENERATED_OUTPUT ?? "src/generated/dify-agent-api";

export default defineConfig({
  input: "contracts/dify-agent-api/v1/openapi.yaml",
  output: {
    clean: true,
    path: generatedOutput,
    postProcess: ["prettier"],
  },
  plugins: [
    "@hey-api/typescript",
    {
      name: "zod",
      compatibilityVersion: 4,
      dates: {
        offset: true,
      },
      definitions: true,
      requests: true,
      responses: true,
    },
  ],
});
