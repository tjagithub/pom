import { test, expect } from '@playwright/test'
import { pom } from '../dist/index.mjs'

test.describe('Verify Build Outputs (MJS & CJS)', () => {
  test('MJS: should export pom correctly', async () => {
    expect(pom).toBeDefined()
    expect(pom.page).toBeDefined()
    expect(pom.button).toBeDefined()
    expect(pom.text).toBeDefined()
    expect(pom.from).toBeDefined()
    expect(pom.within).toBeDefined()
    expect(pom.when).toBeDefined()
    expect(pom.and).toBeDefined()
    expect(pom.or).toBeDefined()
  })

  test('CJS: should export pom correctly', async () => {
    const mod = await import('../dist/index.cjs')
    const pomCjs = mod.pom
    expect(pomCjs).toBeDefined()
    expect(pomCjs.page).toBeDefined()
    expect(pomCjs.button).toBeDefined()
    expect(pomCjs.text).toBeDefined()
    expect(pomCjs.from).toBeDefined()
    expect(pomCjs.within).toBeDefined()
    expect(pomCjs.when).toBeDefined()
    expect(pomCjs.and).toBeDefined()
    expect(pomCjs.or).toBeDefined()
  })

  test('MJS: can create a page definition', async ({ page }) => {
    const pageDef = pom.page({
      submit: pom.button({ name: 'Submit' }),
    })

    expect(pageDef).toBeDefined()
    expect(pageDef.bind).toBeDefined()

    const model = await pageDef.bind(page)
    expect(model.submit).toBeDefined()
  })

  test('CJS: can create a page definition', async ({ page }) => {
    const mod = await import('../dist/index.cjs')
    const pomCjs = mod.pom

    const pageDef = pomCjs.page({
      submit: pomCjs.button({ name: 'Submit' }),
    })

    expect(pageDef).toBeDefined()
    expect(pageDef.bind).toBeDefined()

    const model = await pageDef.bind(page)
    expect(model.submit).toBeDefined()
  })

  test('MJS: pom.text() works', async ({ page }) => {
    await page.setContent(`<span>Hello</span>`)

    const pageDef = pom.page({
      hello: pom.text('Hello'),
    })

    const model = await pageDef.bind(page)
    const text = await model.hello.textContent()
    expect(text).toBe('Hello')
  })

  test('CJS: pom.text() works', async ({ page }) => {
    const mod = await import('../dist/index.cjs')
    const pomCjs = mod.pom

    await page.setContent(`<span>Hello</span>`)

    const pageDef = pomCjs.page({
      hello: pomCjs.text('Hello'),
    })

    const model = await pageDef.bind(page)
    const text = await model.hello.textContent()
    expect(text).toBe('Hello')
  })

  test('MJS: pom.group() works', async ({ page }) => {
    await page.setContent(`
      <div>
        <input aria-label="Username" />
        <button name="Submit">Submit</button>
      </div>
    `)

    const pageDef = pom.page({
      form: pom.group({
        username: pom.textbox({ label: 'Username' }),
        submit: pom.button({ name: 'Submit' }),
      }),
    })

    const model = await pageDef.bind(page)
    await model.form.username.fill('user')
    await model.form.submit.click()
  })

  test('CJS: pom.group() works', async ({ page }) => {
    const mod = await import('../dist/index.cjs')
    const pomCjs = mod.pom

    await page.setContent(`
      <div>
        <input aria-label="Username" />
        <button name="Submit">Submit</button>
      </div>
    `)

    const pageDef = pomCjs.page({
      form: pomCjs.group({
        username: pomCjs.textbox({ label: 'Username' }),
        submit: pomCjs.button({ name: 'Submit' }),
      }),
    })

    const model = await pageDef.bind(page)
    await model.form.username.fill('user')
    await model.form.submit.click()
  })

  test('MJS: pom.from() with ariaSnapshot', async ({ page }) => {
    await page.setContent(`
      <nav>
        <a href="/next">Next</a>
      </nav>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pom.from(snapshot)
    const model = await pom.page(result).bind(page)

    expect(model['navigation']).toBeDefined()
    expect(model['navigation']['Next']).toBeDefined()
  })

  test('CJS: pom.from() with ariaSnapshot', async ({ page }) => {
    const mod = await import('../dist/index.cjs')
    const pomCjs = mod.pom

    await page.setContent(`
      <nav>
        <a href="/next">Next</a>
      </nav>
    `)

    const snapshot = await page.ariaSnapshot()
    const result = pomCjs.from(snapshot)
    const model = await pomCjs.page(result).bind(page)

    expect(model['navigation']).toBeDefined()
    expect(model['navigation']['Next']).toBeDefined()
  })
})
