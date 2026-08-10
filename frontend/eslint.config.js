import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      // Pre-existing pattern in several components; a redesign of those
      // effects is out of scope for the lint adoption. Keep visible.
      'react-hooks/set-state-in-effect': 'warn',
      // parseAiMessage.ts and weatherApi.ts still map untyped LLM/API payloads
      // with `any`; keep visible as warnings without blocking the CI gate.
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
