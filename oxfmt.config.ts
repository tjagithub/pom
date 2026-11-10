import { defineConfig } from 'oxfmt'

export default defineConfig({
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  ignorePatterns: [
    'dist',
    'test-results',
    'playwright-report',
    'tests/fixtures',
  ],
  insertFinalNewline: true,
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
})
