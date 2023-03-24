module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.eslint.json'
  },
  plugins: [
    'react'
  ],
  rules: {
    'promise/param-names': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-loss-of-precision': 'warn',
    '@typescript-eslint/consistent-type-assertions': 'warn',
    '@typescript-eslint/no-dynamic-delete': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn'
  }
  // rules: {
  //   'max-len': 'warn',
  //   'no-console': ['warn', { allow: ['warn', 'error'] }],

  //   'import/no-unresolved': ['error', { ignore: ['^vscode$'] }],
  //   'import/no-extraneous-dependencies': [
  //     'error',
  //     {
  //       devDependencies: true,
  //       optionalDependencies: false,
  //       peerDependencies: false,
  //     },
  //   ],
  // },
  // overrides: [
  //   {
  //     files: ['*.test.tsx'],
  //     plugins: [
  //       'react',
  //       'jest',
  //       'jsx-a11y',
  //     ],
  //     extends: [
  //       'airbnb-typescript',
  //       'plugin:import/recommended',
  //       'plugin:import/typescript',
  //       'plugin:jest/recommended',
  //     ],
  //     env: {
  //       'jest/globals': true,
  //     },
  //     rules: {
  //       'jest/no-disabled-tests': 'warn',
  //       'jest/no-focused-tests': 'error',
  //       'jest/no-identical-title': 'error',
  //       'jest/prefer-to-have-length': 'warn',
  //       'jest/valid-expect': 'error',

  //       'import/no-extraneous-dependencies': [
  //         'error',
  //         {
  //           devDependencies: true,
  //           optionalDependencies: false,
  //           peerDependencies: false,
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     files: ['*.tsx'],
  //     plugins: [
  //       'react',
  //       'jsx-a11y',
  //     ],
  //     extends: [
  //       'airbnb-typescript',
  //       'plugin:import/recommended',
  //       'plugin:import/typescript',
  //     ],
  //     rules: {
  //       'import/no-extraneous-dependencies': [
  //         'error',
  //         {
  //           devDependencies: true,
  //           optionalDependencies: false,
  //           peerDependencies: false,
  //         },
  //       ],
  //     },
  //   },
  // ],
}
