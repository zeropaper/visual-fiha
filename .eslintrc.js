module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["plugin:react/recommended", "standard-with-typescript", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.eslint.json",
  },
  plugins: ["react"],
  rules: {
    "promise/param-names": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-loss-of-precision": "warn",
    "@typescript-eslint/consistent-type-assertions": "warn",
    "@typescript-eslint/no-dynamic-delete": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
  },
};
