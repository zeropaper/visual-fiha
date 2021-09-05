/** @type {import('eslint').Linter.Config} */
// eslint-disable-next-line no-undef
module.exports = {
  plugins: [
    'import',
  ],
  extends: [
    'airbnb-typescript',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'max-len': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    'import/no-unresolved': ['error', { ignore: ['^vscode$'] }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.tsx'],
      plugins: [
        'react',
        'jest',
        'jsx-a11y',
      ],
      extends: [
        'airbnb-typescript',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:jest/recommended',
      ],
      env: {
        'jest/globals': true,
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',

        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
            optionalDependencies: false,
            peerDependencies: false,
          },
        ],
      },
    },
    {
      files: ['*.tsx'],
      plugins: [
        'react',
        'jsx-a11y',
      ],
      extends: [
        'airbnb-typescript',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true,
            optionalDependencies: false,
            peerDependencies: false,
          },
        ],
      },
    },
  ],
};
