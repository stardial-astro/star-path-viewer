// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default defineConfig([
  /* Global configuration */
  globalIgnores(['dist', 'build', 'public']),

  /* Base configuration */
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __APP_NAME__: true,
        __APP_DESCRIPTION__: true,
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: react,
      /* @ts-ignore: TS2322 */
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
    ],
    settings: {
      /* Automatically pick up version from package.json */
      // react: { version: 'detect' },
      react: { version: '19' }, // provide the version explicitly solves the 'contextOrFilename.getFilename' error
    },
    rules: {
      // ...js.configs.recommended.rules,
      // ...react.configs.recommended.rules,
      // ...react.configs['jsx-runtime'].rules,
      // ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      // 'react/display-name': 'off', // temporary workaround for "TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function"
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      /* Ignore unused variables and function args prefixed with _ */
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
]);
