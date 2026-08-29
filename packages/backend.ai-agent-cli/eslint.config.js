import { base } from 'eslint-config-bai';

export default [
  ...base,

  {
    // The test double is plain JS outside the TS project service, and it is a
    // fixture rather than shipped code.
    ignores: ['dist/**', 'src/webmcp/fake-relay.mjs'],
  },

  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
    languageOptions: {
      parserOptions: {
        // `no-floating-promises` requires type information.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
