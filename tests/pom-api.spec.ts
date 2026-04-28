import { test, expect } from '@playwright/test'
import { pom } from '../src/index'

// Reusable handler for newsletter dialog
const dismissNewsletter = pom
  .when(pom.text({ text: 'Sign up to the newsletter' }))
  .do(pom.click(pom.button({ name: 'No thanks' })))

test.describe('POM API - Core Functionality', () => {
  test('pom.page().bind() creates page object with locators', async ({
    page,
  }) => {
    await page.setContent(`
      <button name="submit">Submit</button>
      <input aria-label="Username" />
    `)

    const pageDef = pom.page({
      submit: pom.button({ name: 'submit' }),
      username: pom.textbox({ label: 'Username' }),
    })

    const model = await pageDef.bind(page)

    expect(model.submit).toBeDefined()
    expect(model.username).toBeDefined()
    await model.submit.click()
    await model.username.fill('testuser')
    const value = await page
      .locator('input[aria-label="Username"]')
      .inputValue()
    expect(value).toBe('testuser')
  })

  test('string shorthand for element factories', async ({ page }) => {
    await page.setContent(`<button name="Save">Save</button>`)

    const pageDef = pom.page({
      save: pom.button('Save'),
    })

    const model = await pageDef.bind(page)
    await model.save.click()
    // If no error, click worked
  })

  test('pom.group() creates nested structure', async ({ page }) => {
    await page.setContent(`
      <form>
        <input aria-label="Username" id="user" />
        <input type="password" aria-label="Password" id="pass" />
        <button name="Submit">Submit</button>
      </form>
    `)

    const pageDef = pom.page({
      form: pom.group({
        username: pom.textbox({ selector: '#user' }),
        password: pom.textbox({ selector: '#pass' }),
      }),
      submit: pom.button({ name: 'Submit' }),
    })

    const model = await pageDef.bind(page)

    // Access nested group elements
    expect(model.form.username).toBeDefined()
    expect(model.form.password).toBeDefined()
    await model.form.username.fill('user')
    await model.form.password.fill('pass')
    await model.submit.click()
  })

  test('pom.within() scopes child to parent', async ({ page }) => {
    await page.setContent(`
      <section>
        <button name="Click me">Click me</button>
      </section>
    `)

    const pageDef = pom.page({
      scopedButton: pom.within(
        pom.locator('section'),
        pom.button({ name: 'Click me' }),
      ),
    })

    const model = await pageDef.bind(page)
    await model.scopedButton.click()
    // If no error, the scoped locator worked
  })

  test('pom.text() creates text locator', async ({ page }) => {
    await page.setContent(`<p>Hello World</p>`)

    const pageDef = pom.page({
      greeting: pom.text({ text: 'Hello World' }),
    })

    const model = await pageDef.bind(page)
    const text = await model.greeting.textContent()
    expect(text).toBe('Hello World')
  })

  test('pom.locator() creates CSS selector locator', async ({ page }) => {
    await page.setContent(`<div class="my-class">Content</div>`)

    const pageDef = pom.page({
      content: pom.locator('.my-class'),
    })

    const model = await pageDef.bind(page)
    const text = await model.content.textContent()
    expect(text).toBe('Content')
  })

  test('pom.testId() creates testId locator', async ({ page }) => {
    await page.setContent(`<button data-testid="submit-btn">Submit</button>`)

    const pageDef = pom.page({
      submit: pom.testId('submit-btn'),
    })

    const model = await pageDef.bind(page)
    await model.submit.click()
  })
})

test.describe('POM API - Handler (when/do)', () => {
  test('pom.when().do() creates reusable handler', async ({ page }) => {
    await page.setContent(`
      <div id="newsletter" style="display:none;">
        Sign up to the newsletter
        <button name="No thanks" onclick="document.getElementById('newsletter').style.display='none'">No thanks</button>
      </div>
      <button id="show-newsletter" onclick="document.getElementById('newsletter').style.display='block'">Show Newsletter</button>
    `)

    const dismissHandler = pom
      .when(pom.text({ text: 'Sign up to the newsletter' }))
      .do(pom.click(pom.button({ name: 'No thanks' })))

    const pageDef = pom.page({
      showNewsletter: pom.button({ selector: '#show-newsletter' }),
      handles: [dismissHandler],
    })

    const model = await pageDef.bind(page)

    // Show the newsletter dialog - this should trigger the handler
    await model.showNewsletter.click()

    // Wait for newsletter to be hidden (handler should have clicked "No thanks")
    await page.waitForSelector('#newsletter', {
      state: 'hidden',
      timeout: 5000,
    })
  })

  test('handler reuse across multiple pages', async ({ page }) => {
    const dismissNewsletter = pom
      .when(pom.text({ text: 'Sign up' }))
      .do(pom.click(pom.button({ name: 'Close' })))

    const pageDef1 = pom.page({
      handles: [dismissNewsletter],
    })

    const pageDef2 = pom.page({
      handles: [dismissNewsletter],
    })

    // Both page definitions share the same handler
    const model1 = await pageDef1.bind(page)
    const model2 = await pageDef2.bind(page)

    expect(model1).toBeDefined()
    expect(model2).toBeDefined()
  })
})

test.describe('POM API - And/Or', () => {
  test('pom.and() combines locators', async ({ page }) => {
    await page.setContent(`
      <button name="Subscribe" title="Newsletter">Subscribe</button>
    `)

    const pageDef = pom.page({
      subscribeBtn: pom.and(
        pom.button({ name: 'Subscribe' }),
        pom.locator('button[title="Newsletter"]'),
      ),
    })

    const model = await pageDef.bind(page)
    const count = await model.subscribeBtn.count()
    expect(count).toBe(1)
  })

  test('pom.or() provides alternative locators', async ({ page }) => {
    await page.setContent(`
      <button name="New email">New email</button>
    `)

    const pageDef = pom.page({
      newEmail: pom.or(
        pom.button({ name: 'New email' }),
        pom.button({ name: 'Compose' }),
      ),
    })

    const model = await pageDef.bind(page)
    await model.newEmail.click()
  })
})

test.describe('POM API - Aria Group (renamed from group)', () => {
  test('pom.ariaGroup() for ARIA group role', async ({ page }) => {
    await page.setContent(`
      <div role="group" aria-label="Settings">
        <button>Option 1</button>
      </div>
    `)

    const pageDef = pom.page({
      settingsGroup: pom.ariaGroup({ name: 'Settings' }),
    })

    const model = await pageDef.bind(page)
    const count = await model.settingsGroup.count()
    expect(count).toBe(1)
  })
})
