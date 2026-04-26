// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
/* @ts-ignore: TS2307 */
import js from '@eslint/js';
import globals from 'globals';
import eslintReact from '@eslint-react/eslint-plugin';
import ts from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import { importX } from 'eslint-plugin-import-x';

export default defineConfig([
  /* Global configuration */
  globalIgnores([
    'dist',
    'dev-dist',
    'build',
    'public',
    '__mocks__',
    'docs/.vitepress/cache',
    'docs/.vitepress/dist',
    'docs/.vitepress/.temp',
  ]),

  eslintReact.configs.recommended,

  /* Base configuration */
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        __APP_NAME__: true,
        __APP_DESCRIPTION__: true,
        ...globals.browser,
        ...globals.node,
      },
      parser: ts.parser, // Use the TS parser for everything
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-x': eslintReact,
      /* @ts-ignore: TS2322 */
      'react-hooks': reactHooks,
      'react-refresh': pluginReactRefresh,
      'import-x': importX,
    },
    settings: {
      // react: { version: '19' }, // provide the version explicitly solves the 'contextOrFilename.getFilename' error
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
      'import-x/ignore': ['\\.d\\.ts$'],
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...importX.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      /* Ignore unused variables and function args prefixed with _ */
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      'import-x/no-unresolved': ['error', { ignore: ['^virtual:'] }],
    },
  },
  /* Special Override for Global Type Definition files */
  {
    files: ['**/*.d.ts'],
    rules: {
      'import-x/no-unresolved': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
]);
