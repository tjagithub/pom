import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect } from '@playwright/test'
import { pom } from '../src/index'

const bind = (page: any, snapshot: string) => pom.page(pom.from(snapshot)).bind(page) as Promise<any>

test.describe('pom.from() - real ARIA snapshot syntax', () => {
  test('a link with a /url child stays a locator named after the link', async ({ page }) => {
    await page.setContent('<a href="/g">Gmail</a>')
    const model = await bind(page, '- link "Gmail":\n  - /url: /g')
    await expect(model.Gmail).toHaveAttribute('href', '/g')
  })

  test('nests more than one level deep', async ({ page }) => {
    await page.setContent('<main><nav><a href="/a">A</a><a href="/b">B</a></nav><h1>Title</h1></main>')
    const model = await bind(page, `
- main:
  - navigation:
    - link "A":
      - /url: /a
    - link "B":
      - /url: /b
  - heading "Title" [level=1]
`)
    await expect(model.main.navigation.A).toHaveAttribute('href', '/a')
    await expect(model.main.navigation.B).toHaveAttribute('href', '/b')
    await expect(model.main.Title).toHaveText('Title')
  })

  test('duplicate names get numbered keys and resolve to different elements', async ({ page }) => {
    await page.setContent('<a href="/1">More</a><a href="/2">More</a><a href="/3">More</a>')
    const model = await bind(page, '- link "More"\n- link "More"\n- link "More"')
    await expect(model.More).toHaveAttribute('href', '/1')
    await expect(model['More 2']).toHaveAttribute('href', '/2')
    await expect(model['More 3']).toHaveAttribute('href', '/3')
  })

  test('children are scoped to their parent container', async ({ page }) => {
    await page.setContent('<nav><a href="/n">Home</a></nav><footer><a href="/f">Home</a></footer>')
    const model = await bind(page, '- navigation:\n  - link "Home"\n- contentinfo:\n  - link "Home"')
    await expect(model.navigation.Home).toHaveAttribute('href', '/n')
    await expect(model.contentinfo.Home).toHaveAttribute('href', '/f')
  })

  test('attributes become role options', async ({ page }) => {
    await page.setContent('<h1>One</h1><h2>Two</h2><input type="checkbox" checked aria-label="Agree"><button disabled>Go</button>')
    const model = await bind(page, `
- heading "One" [level=1]
- heading "Two" [level=2]
- checkbox "Agree" [checked]
- button "Go" [disabled]
`)
    await expect(model.One).toHaveText('One')
    await expect(model.Two).toHaveText('Two')
    await expect(model.Agree).toBeChecked()
    await expect(model.Go).toBeDisabled()
  })

  test('inline text and quoted values do not break parsing', async ({ page }) => {
    await page.setContent('<button>Search</button><input aria-label="Email">')
    const model = await bind(page, '- button "Search": Search\n- textbox "Email": a@b.c\n- text: "|"')
    await expect(model.Search).toBeVisible()
    await expect(model.Email).toBeVisible()
  })

  test('on a name clash the interactive role keeps the plain key', async ({ page }) => {
    await page.setContent('<main><h1>Sign in</h1><button>Sign in</button></main>')
    const model = await bind(page, '- main:\n  - heading "Sign in" [level=1]\n  - button "Sign in"')
    await expect(model.main['Sign in']).toHaveRole('button')
    await expect(model.main['Sign in heading']).toHaveRole('heading')
  })

  test('text nodes are dropped inside containers but kept at the top level', async ({ page }) => {
    await page.setContent('<main><button>Go</button></main>')
    const model = await bind(page, '- text: top\n- main:\n  - text: label\n  - button "Go"')
    expect(Object.keys(model)).toEqual(['text', 'main'])
    expect(Object.keys(model.main)).toEqual(['$', 'Go'])
  })

  test('names with quotes and long names give usable keys', async ({ page }) => {
    const long = 'x'.repeat(200)
    const result = pom.from(`- button "Say \\"hi\\""\n- link "${long}"`)
    const keys = Object.keys(result)
    expect(keys).toContain('Say "hi"')
    expect(keys.every((k) => k.length <= 60)).toBe(true)
  })

  const dir = join(import.meta.dirname, 'fixtures')
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
    test(`real snapshot ${file} parses and binds`, async ({ page }) => {
      const result = pom.from(readFileSync(join(dir, file), 'utf8'))
      expect(Object.keys(result).length).toBeGreaterThan(0)
      expect(Object.keys(result)).not.toContain('')
      const model = await pom.page(result).bind(page)
      expect(Object.keys(model).length).toBe(Object.keys(result).length)
    })
  }
})
