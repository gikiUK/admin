import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([".next/**", ".open-next/**", "out/**", "build/**", "next-env.d.ts"]),

  // TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // ===================
      // Essential (catch real bugs)
      // ===================

      // Disallow unhandled promises (must await or explicitly void).
      "@typescript-eslint/no-floating-promises": "error",

      // Error when awaiting a non-Promise value.
      "@typescript-eslint/await-thenable": "error",

      // Warn on unused variables, but allow names starting with `_`.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_"
        }
      ],

      // ===================
      // Good hygiene
      // ===================

      // Always use `import type` for type-only imports.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" }
      ],

      // Enforce strict equality (=== / !==), except allow == null for null/undefined checks.
      eqeqeq: ["error", "smart"],

      // ===================
      // Style preferences
      // ===================

      // Prefer function declarations (hoisting, better for APIs),
      // but allow arrow functions when used as callbacks.
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],

      // Forbid top-level arrow functions assigned to const.
      // Encourages named declarations for exported/public functions.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program > VariableDeclaration > VariableDeclarator[init.type='ArrowFunctionExpression']",
          message: "Use a function declaration for top-level APIs (e.g., `function name(){}`)"
        }
      ],

      // Naming conventions: PascalCase for types, camelCase for variables/functions.
      "@typescript-eslint/naming-convention": [
        "warn",
        // Types, interfaces, classes, and enums in PascalCase
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enum", format: ["PascalCase"] },
        // Variables in camelCase, PascalCase (for React components), or UPPER_CASE (constants)
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow"
        },
        // Functions in camelCase (or PascalCase for components)
        { selector: "function", format: ["camelCase", "PascalCase"] }
      ],

      // Prefer `interface` over `type` for object shapes (cleaner merging).
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      // Require braces around all control statements (if/else/while).
      curly: ["error", "all"],

      // Warn when else is redundant after return.
      "no-else-return": "warn",

      // Warn when fields/params could be marked readonly but aren't.
      "@typescript-eslint/prefer-readonly": "warn"
    }
  }
]);

export default eslintConfig;
