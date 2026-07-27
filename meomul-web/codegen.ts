import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "../meomul/apps/meomul-api/src/schema.gql",
  generates: {
    "./types/backend-dtos.generated.ts": {
      plugins: ["typescript"],
      config: {
        enumsAsTypes: true,
        maybeValue: "T | null",
        inputMaybeValue: "T | null",
        scalars: {
          DateTime: "string",
        },
      },
    },
  },
};

export default config;
