import { test, expect } from '@playwright/test'
import { pom } from '../src/index'

test.describe('POM.within() with pom.form()', () => {
  test('scope button inside form', async ({ page }) => {
    await page.setContent(`
      <form aria-label="login">
        <input name="username" />
        <button name="submit">Submit</button>
      </form>
      <button name="submit">Outside Submit</button>
    `)

    // Debug: check if form is found
    const formCount = await page.getByRole('form', { name: 'login' }).count()
    console.log('Form count:', formCount)

    const submitInFormCount = await page.getByRole('form', { name: 'login' })
      .filter({ has: page.getByRole('button', { name: 'submit' }) })
      .count()
    console.log('Submit in form count (native):', submitInFormCount)

    const pageDef = pom.page({
      submitInForm: pom.within(
        pom.form({ name: 'login' }),
        pom.button({ name: 'submit' })
      ),
    })

    const model = await pageDef.bind(page)

    const count = await model.submitInForm.count()
    console.log('POM submitInForm count:', count)

    expect(count).toBe(1)

    // Click it
    await model.submitInForm.click()
  })

  test('scope multiple elements inside form', async ({ page }) => {
    await page.setContent(`
      <form aria-label="login">
        <input aria-label="username" />
        <input aria-label="password" type="password" />
        <button name="submit">Submit</button>
      </form>
    `)

    const pageDef = pom.page({
      loginForm: pom.group({
        username: pom.within(
          pom.form({ name: 'login' }),
          pom.textbox({ label: 'username' })
        ),
        password: pom.within(
          pom.form({ name: 'login' }),
          pom.textbox({ label: 'password' })
        ),
        submit: pom.within(
          pom.form({ name: 'login' }),
          pom.button({ name: 'submit' })
        ),
      }),
    })

    const model = await pageDef.bind(page)

    await model.loginForm.username.fill('user')
    await model.loginForm.password.fill('pass')
    await model.loginForm.submit.click()
  })

  test('pom.within() with CSS selector', async ({ page }) => {
    await page.setContent(`
      <section id="login">
        <button name="submit">Submit</button>
      </section>
      <button name="submit">Outside</button>
    `)

    const pageDef = pom.page({
      submitInSection: pom.within(
        pom.locator('#login'),
        pom.button({ name: 'submit' })
      ),
    })

    const model = await pageDef.bind(page)

    const count = await model.submitInSection.count()
    expect(count).toBe(1)
  })
})
