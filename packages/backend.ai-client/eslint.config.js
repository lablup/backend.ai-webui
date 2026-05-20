import { base } from 'eslint-config-bai';

export default [
  ...base,

  {
    ignores: ['dist/**'],
  },

  {
    rules: {
      // Enforce `import type` for type-only imports.
      '@typescript-eslint/consistent-type-imports': 'error',
      // Surface real bugs from un-awaited promises.
      '@typescript-eslint/no-floating-promises': 'error',
      // Existing code has many `any`s; a strict-typing pass is tracked
      // separately under the FR-2792 epic. Keep as warn (overrides the
      // shared base which currently turns this rule off entirely) so
      // the noise is visible without being a publish-blocker.
      '@typescript-eslint/no-explicit-any': 'warn',
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

  // Tests: relax the strictest rules so test scaffolding (e.g. mock
  // objects typed as `any`, intentionally fire-and-forget assertions)
  // does not block `prepublishOnly`.
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
