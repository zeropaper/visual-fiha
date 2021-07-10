/** @type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
  plugins: ['jest'],
  extends: ['airbnb-typescript', 'plugin:jest/recommended'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  env: {
    'jest/globals': true,
  },
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',

    'max-len': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    'import/no-extraneous-dependencies': ['error', { devDependencies: true, optionalDependencies: false, peerDependencies: false }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
    },
  ],
};
