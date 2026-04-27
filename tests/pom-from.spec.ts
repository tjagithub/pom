import { test, expect } from '@playwright/test'
import { pom } from '../src/index'

test.describe('POM.from() - ARIA Snapshot Parser', () => {
  test('parses simple ARIA snapshot', async ({ page }) => {
    const ariaSnapshot = `
- button "Submit"
- link "Cancel"
    `.trim()

    const result = pom.from(ariaSnapshot)

    expect(Object.keys(result)).toContain('Submit')
    expect(Object.keys(result)).toContain('Cancel')
  })

  test('parses nested structure with groups', async ({ page }) => {
    const ariaSnapshot = `
- navigation:
  - link "Gmail"
  - link "Images"
- contentinfo:
  - link "Privacy"
  - link "Terms"
    `.trim()

    const result = pom.from(ariaSnapshot)

    expect(Object.keys(result)).toContain('navigation')
    expect(Object.keys(result)).toContain('contentinfo')

    // Bind to page to verify structure
    await page.setContent(`
      <nav>
        <a href="/gmail">Gmail</a>
        <a href="/images">Images</a>
      </nav>
      <footer>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </footer>
    `)

    const model = await pom.page(result).bind(page)
    expect(model.navigation).toBeDefined()
    expect(model.contentinfo).toBeDefined()
  })

  test('handles text nodes', async ({ page }) => {
    const ariaSnapshot = `
- text: Hello World
- button "Click me"
    `.trim()

    const result = pom.from(ariaSnapshot)

    // Text nodes use 'text' as key (role-based)
    expect(Object.keys(result)).toContain('text')
    expect(Object.keys(result)).toContain('Click me')

    // Verify the text node works
    await page.setContent(`<span>Hello World</span><button>Click me</button>`)
    const model = await pom.page(result).bind(page)
    expect(model.text).toBeDefined()
    expect(model['Click me']).toBeDefined()
  })

  test('real-world Google homepage snapshot', async ({ page }) => {
    const ariaSnapshot = `
- navigation:
  - link "Gmail":
    - /url: https://mail.google.com
  - link "Search for Images":
    - /url: https://images.google.com
    - text: Images
  - button "Google apps"
  - link "Sign in"
- search:
  - button "Google Search"
  - button "I'm Feeling Lucky"
- contentinfo:
  - link "Privacy"
  - link "Terms"
    `.trim()

    const result = pom.from(ariaSnapshot)

    // Top-level keys
    expect(Object.keys(result)).toContain('navigation')
    expect(Object.keys(result)).toContain('search')
    expect(Object.keys(result)).toContain('contentinfo')

    // Verify it's parseable
    expect(result.navigation).toBeDefined()
    expect(result.search).toBeDefined()
    expect(result.contentinfo).toBeDefined()
  })
})
