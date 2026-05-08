import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // ── Ignore generated / vendored output ────────────────────────────────────
  {
    ignores: [
      "docs/**",
      "node_modules/**",
      "dist/**",
      "server/**",
      "contracts/**",
      "*.config.js",
    ],
  },

  // ── Base JS recommended rules ──────────────────────────────────────────────
  js.configs.recommended,

  // ── React / JSX source files ───────────────────────────────────────────────
  {
    files: ["src/**/*.{js,jsx}"],

    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Browser & Node globals
        ...globals.browser,
        ...globals.node,
        // Project-specific globals injected at runtime
        window: "readonly",
        Buffer: "readonly",
      },
    },

    settings: {
      react: {
        // Automatically detect the React version
        version: "detect",
      },
    },

    rules: {
      // ── Unused variables / imports (main goal) ─────────────────────────────
      "no-unused-vars": [
        "warn",
        {
          // Ignore vars that start with _ (common intentional-ignore convention)
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          // Ignore destructured rest siblings (e.g. const { a, ...rest } = obj)
          ignoreRestSiblings: true,
          // Don't flag unused function arguments that come before used ones
          args: "after-used",
        },
      ],

      // ── React rules ────────────────────────────────────────────────────────
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",   // not needed with React 17+ JSX transform
      "react/prop-types": "off",            // project uses plain JS, no PropTypes enforcement
      "react/display-name": "off",

      // ── React Hooks rules ──────────────────────────────────────────────────
      ...reactHooks.configs.recommended.rules,

      // ── React Refresh (Vite HMR) ───────────────────────────────────────────
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ── General code-quality rules ─────────────────────────────────────────
      "no-console": "off",               // console.log is used extensively for debug
      "no-undef": "warn",               // catch references to undeclared globals
      "no-duplicate-imports": "warn",
      "no-var": "warn",                 // prefer const/let
      "prefer-const": ["warn", { destructuring: "all" }],
    },
  },
];
