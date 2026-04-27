import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: {
    toMatchAriaSnapshot: {
      pathTemplate: '__snapshots__/aria/{testFilePath}/{arg}{ext}',
    },
  },
  snapshotDir: 'snapshots',
  testDir: './',
  timeout: 5_000,
  use: {
    actionTimeout: 500,
    headless: true,
  },
})
