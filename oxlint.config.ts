import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
    perf: 'warn',
    suspicious: 'warn',
  },
  ignorePatterns: ['dist', 'test-results', 'playwright-report'],
  plugins: ['typescript', 'oxc', 'import'],
  rules: {
    'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
  },
})
