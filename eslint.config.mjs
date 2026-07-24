import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const typedTypeScriptConfigs = tseslint.configs.recommendedTypeChecked.map(
  (configuration) => ({
    ...configuration,
    files: ["**/*.{ts,tsx}"],
  }),
);

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
  eslint.configs.recommended,
  ...typedTypeScriptConfigs,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{cjs,mjs}"],
    languageOptions: {
      globals: {
        module: "readonly",
        process: "readonly",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      complexity: ["error", 12],
      "import/no-cycle": "error",
      "max-depth": ["error", 3],
      "max-lines": [
        "error",
        {
          max: 500,
          skipBlankLines: true,
          skipComments: false,
        },
      ],
      "max-lines-per-function": [
        "error",
        {
          IIFEs: true,
          max: 80,
          skipBlankLines: true,
          skipComments: false,
        },
      ],
      "max-params": ["error", 4],
      "no-nested-ternary": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
