import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ),
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      // Prefer modern variable declarations
      'prefer-const': 'error',
      'no-var': 'error',

      // Enforce consistent type definition style
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // Naming conventions
      '@typescript-eslint/naming-convention': [
        'error',
        // Types, Interfaces, Classes, Enums -> PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Functions -> camelCase or PascalCase (for React components)
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Variables (default) -> camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allowDouble',
        },
        // Parameters -> camelCase (allow leading underscore when intentionally unused)
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
    },
  },
  // Stricter constant naming in dedicated constants files/directories
  {
    files: ['src/shared/constants/**', 'src/**/constants.ts', 'src/**/constants/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // In constants files, exported consts must be UPPER_CASE
        {
          selector: 'variable',
          modifiers: ['const', 'exported'],
          format: ['UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Default variables can still be camelCase for internal helpers
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allowDouble',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
