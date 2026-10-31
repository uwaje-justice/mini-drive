import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "api/src/generated/**",
      "api/uploads/**",
      "client/dist/**",
      "**/coverage/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["api/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
    },
  },
];
