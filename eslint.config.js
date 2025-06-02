import antfu from "@antfu/eslint-config";

export default antfu({
  formatters: {
    prettierOptions: {
      printWidth: 100,
      trailingComma: "all",
      singleQuote: false,
      semi: true,
      tabWidth: 2,
      quoteProps: "as-needed",
      jsxSingleQuote: false,
      arrowParens: "always",
    },
  },
  stylistic: false,
  type: "lib",
  typescript: true,
  name: "llmpeg",
  gitignore: true,
}).append({
  ignores: ["README.md"],
  files: ["./src/**/*.ts"],
  rules: {
    "no-console": "off",
    "unicorn/prefer-node-protocol": "off",
    "antfu/if-newline": "off",
    "test/prefer-lowercase-title": "off",
    "unicorn/no-new-array": "off",
    "test/prefer-hooks-in-order": "off",
    "ts/no-unsafe-function-type": "off",
    "perfectionist/sort-imports": "off",
    "ts/explicit-function-return-type": "off",
    "regexp/no-unused-capturing-group": "off",
    "node/prefer-global/buffer": "off",
    "node/prefer-global/process": "off",
    "no-throw-literal": "off",
    "perfectionist/sort-named-imports": ["error", { order: "desc" }],
  },
});
