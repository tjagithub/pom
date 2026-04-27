import { test as baseTest } from '@playwright/test'
import { pom } from '../src/index.ts'

const p = pom.page({
  group: pom.group({
    password: pom.textbox({ name: 'Password' }),
    username: pom.textbox({ name: 'Username' }),
  }),
  submitButton: pom.button({ name: 'Submit' }),
})

interface PageExtensions {
  mainPage: Awaited<ReturnType<typeof p.bind>>
}
export const test = baseTest.extend<PageExtensions>({
  mainPage: async ({ page }, use) => {
    const binding = await p.bind(page)
    await use(binding)
  },
})

// biome-ignore lint/performance/noBarrelFile: This is a fixture file
export { expect } from '@playwright/test'
