import { test, expect } from '@playwright/test'
import { pom } from '../src/index'

test.describe('POM Typed API - Options Support', () => {
  test('button with getByRole options', async ({ page }) => {
    await page.setContent(`
      <button name="Submit">Submit</button>
      <button name="Cancel">Cancel</button>
    `)

    const pageDef = pom.page({
      submitBtn: pom.button({ name: 'Submit' }),
      cancelBtn: pom.button({ name: 'Cancel' }),
    })

    const model = await pageDef.bind(page)

    await model.cancelBtn.click()
    await model.submitBtn.click()
    expect(model.submitBtn).toBeDefined()
  })

  test('text with exact option', async ({ page }) => {
    await page.setContent(`
      <span>Hello</span>
      <span>Hello World</span>
    `)

    const pageDef = pom.page({
      helloText: pom.text({ text: 'Hello', exact: true }),
      helloWorld: pom.text('Hello World'),
    })

    const model = await pageDef.bind(page)

    const helloCount = await model.helloText.count()
    expect(helloCount).toBe(1)

    const worldCount = await model.helloWorld.count()
    expect(worldCount).toBe(1)
  })

  test('locator with options', async ({ page }) => {
    await page.setContent(`
      <div class="item">Item 1</div>
      <div class="item">Item 2</div>
    `)

    const pageDef = pom.page({
      items: pom.locator('.item'),
    })

    const model = await pageDef.bind(page)

    const count = await model.items.count()
    expect(count).toBe(2)
  })

  test('getByRole with name regex', async ({ page }) => {
    await page.setContent(`
      <button name="Submit Form">Submit</button>
      <button name="Cancel Form">Cancel</button>
    `)

    const pageDef = pom.page({
      submitBtn: pom.button({ name: /Submit/ }),
    })

    const model = await pageDef.bind(page)

    await model.submitBtn.click()
    expect(model.submitBtn).toBeDefined()
  })

  test('label with exact option', async ({ page }) => {
    await page.setContent(`
      <label for="email">Email Address</label>
      <input id="email" />
    `)

    const pageDef = pom.page({
      emailInput: pom.textbox({ label: 'Email Address', exact: true }),
    })

    const model = await pageDef.bind(page)

    await model.emailInput.fill('test@example.com')
    const value = await page.locator('#email').inputValue()
    expect(value).toBe('test@example.com')
  })
})
