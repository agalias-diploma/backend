import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"], 
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node  // Add Node.js globals which includes 'process'
      }
    }
  },
  // Add Jest configuration for test files
  {
    files: ["**/*.test.js", "**/tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest  // Add Jest globals (describe, it, expect, jest, etc.)
      }
    }
  },
  pluginJs.configs.recommended,
];