import { expect, test } from '@playwright/test'
import { pom } from '../src/index.ts'

test.describe('POM.from() - Click Verification', () => {
  test('clicking link in group works', async ({ page }) => {
    await page.setContent(`
      <nav>
        <a href="/next" onclick="event.preventDefault(); window.__clicked = true">Go to Next</a>
      </nav>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pom.from(snapshot)
    const model = await pom.page(result).bind(page)

    // navigation is a group, access the link inside it
    const nav = model['navigation'] as any
    expect(nav).toBeDefined()
    expect(nav['Go to Next']).toBeDefined()

    await nav['Go to Next'].click()

    // Verify the link was clicked
    const clicked = await page.evaluate(() => (window as any).__clicked)
    expect(clicked).toBe(true)
  })

  test('clicking second link in nav works', async ({ page }) => {
    await page.setContent(`
      <nav>
        <a href="/home">Home</a>
        <a href="/about" onclick="event.preventDefault(); window.__clickedHref = this.href">About</a>
      </nav>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pom.from(snapshot)
    const model = await pom.page(result).bind(page)

    const nav = model['navigation'] as any
    await nav['About'].click()

    const clickedHref = await page.evaluate(() => (window as any).__clickedHref)
    expect(clickedHref).toContain('/about')
  })

  test('clicking link in contentinfo group works', async ({ page }) => {
    await page.setContent(`
      <footer>
        <a href="/privacy" onclick="event.preventDefault(); window.__clickedHref = this.href">Privacy</a>
        <a href="/terms">Terms</a>
      </footer>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pom.from(snapshot)
    const model = await pom.page(result).bind(page)

    const footer = model['contentinfo'] as any
    expect(footer).toBeDefined()
    await footer['Privacy'].click()

    const clickedHref = await page.evaluate(() => (window as any).__clickedHref)
    expect(clickedHref).toContain('/privacy')
  })

  test('local page: parsed snapshot links work', async ({ page }) => {
    await page.setContent(`
      <nav>
        <a href="/about" onclick="event.preventDefault(); window.__clicked = this.href">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <main>
        <button id="submit">Submit</button>
      </main>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pom.from(snapshot)
    const model = await pom.page(result).bind(page)

    // navigation is a group, click About inside it
    const nav = model['navigation'] as any
    expect(nav).toBeDefined()
    expect(nav['About']).toBeDefined()

    await nav['About'].click()

    // Verify the link was clicked
    const clicked = await page.evaluate(() => (window as any).__clicked)
    expect(clicked).toContain('/about')
  })

  test('pom.from() with nested groups - click works', async ({ page }) => {
    await page.setContent(`
      <nav>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
      <footer>
        <a href="/privacy" onclick="event.preventDefault(); window.__clickedHref = this.href">Privacy</a>
        <a href="/terms">Terms</a>
      </footer>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pom.from(snapshot)

    // Should have navigation and contentinfo groups
    expect(result['navigation']).toBeDefined()
    expect(result['contentinfo']).toBeDefined()

    const model = await pom.page(result).bind(page)

    // Click Privacy in footer
    const contentinfo = model['contentinfo'] as any
    await contentinfo['Privacy'].click()

    const clickedHref = await page.evaluate(() => (window as any).__clickedHref)
    expect(clickedHref).toContain('/privacy')
  })
})
