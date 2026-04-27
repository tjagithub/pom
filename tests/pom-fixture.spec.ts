import { expect, test } from '../examples/fixture'

test.use({ actionTimeout: 500 })
test('should find elements by config', async ({ page, mainPage }) => {
  test.setTimeout(10_000)
  await page.setContent(`
    <div>
      <input type="text" name="Username" aria-label="Username" />
      <input type="password" name="Password" aria-label="Password" />
      <button>Submit</button>
    </div>
  `)
  await mainPage.submitButton.click()
  await mainPage.group.username.fill('testuser')
  await mainPage.group.password.fill('password')
  await expect(mainPage.group.username).toHaveValue('testuser')
  await expect(mainPage.group.password).toHaveValue('password')
})
