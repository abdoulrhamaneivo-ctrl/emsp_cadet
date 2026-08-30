import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/_template_pages/**', 'public/mockServiceWorker.js']),
  {
    files: ['src/app/providers/**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs['recommended-latest']],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // ^motion$ : ESLint core ne trace pas les usages JSX (<motion.div>) sans le plugin react
      // ^[A-Z] en args : composants déstructurés en props ({ icone: Icone }) — même cécité
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|^motion$', argsIgnorePattern: '^_|^[A-Z]', caughtErrors: 'none' }],
    },
  },
  {
    files: ['src/app/providers/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        fireEvent: 'readonly',
        waitFor: 'readonly',
        render: 'readonly',
        screen: 'readonly',
        cleanup: 'readonly',
        http: 'readonly',
        HttpResponse: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
])
