import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      js,
      prettier,
    },
    rules: {
      ...prettier.configs.recommended.rules,
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
    languageOptions: {
      globals: globals.browser,
    },
    extends: ['js/recommended'],
  },
  tseslint.configs.recommended,
]);
