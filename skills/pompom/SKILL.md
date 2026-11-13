---
name: pompom
description: Write Playwright page objects with @pomkit/pompom, the Zod-style POM library. Use when code imports `@pomkit/pompom` or `pom`, when the user wants page objects, locator handlers or a POM generated from an ARIA snapshot in a `@playwright/test` project, or when a pompom model resolves the wrong element.
---

# pompom

`@pomkit/pompom` builds Playwright page objects from declarative descriptors. Each factory returns a `Def<Locator>`, a function `(ctx: Page | Locator) => Locator`. Nothing touches the page until `bind(page)`.

```bash
npm install -D @pomkit/pompom   # peer: @playwright/test ^1.59
```

## Core flow

```ts
import { test, expect } from '@playwright/test'
import { pom } from '@pomkit/pompom'

const loginPage = pom.page({
  form: pom.group({
    username: pom.textbox({ name: 'Username' }),
    password: pom.textbox({ name: 'Password' }),
  }),
  submit: pom.button('Log in'), // string shorthand = { name }
})

test('login', async ({ page }) => {
  await page.goto('/login')
  const model = await loginPage.bind(page) // model is fully typed
  await model.form.username.fill('me')
  await model.form.password.fill('secret')
  await model.submit.click()
  await expect(page).toHaveURL(/dashboard/)
})
```

Define page objects at module level and bind inside the test or a fixture. `bind` creates locators lazily, the same as `page.getByRole`. You can bind before navigation.

## Factories

| Need                   | Use                                                 | Playwright equivalent                 |
| ---------------------- | --------------------------------------------------- | ------------------------------------- |
| ARIA role              | `pom.button({ name, exact, disabled, level, ... })` | `getByRole('button', opts)`           |
| Role by name           | `pom.link('Docs')`                                  | `getByRole('link', { name: 'Docs' })` |
| CSS                    | `pom.locator('.card')`                              | `locator('.card')`                    |
| Test id                | `pom.testId('save')`                                | `getByTestId('save')`                 |
| Text                   | `pom.text({ text: 'Hi', exact: true })`             | `getByText('Hi', { exact: true })`    |
| Nesting (no DOM scope) | `pom.group({ ... })`                                | plain object                          |
| Descendant             | `pom.within(parent, child)`                         | `parent.getBy...(child)`              |
| Both match             | `pom.and(a, b)`                                     | `a.and(b)`                            |
| Either match           | `pom.or(a, b)`                                      | `a.or(b)`                             |

Every ARIA role has a factory named after it (`dialog`, `heading`, `navigation`, `row`, `tab`, ...). The ARIA `group` role is `pom.ariaGroup` because `pom.group` is the logical grouping helper.

Role factories take Playwright's `getByRole` options (`name`, `exact`, `checked`, `disabled`, `expanded`, `includeHidden`, `level`, `pressed`, `selected`). They also take one alternative strategy, which replaces the role lookup: `{ label }` (`getByLabel`), `{ testId }`, `{ text }` or `{ selector }` (CSS). Prefer role and name locators, then `label`, then `testId`, then CSS.

## Scoping

`pom.group` only nests keys. It does not scope locators. To find a child inside a container, use `pom.within`:

```ts
const settings = pom.page({
  saveInDialog: pom.within(pom.dialog('Settings'), pom.button('Save')),
  firstRowEdit: pom.within(pom.row('Alice'), pom.button('Edit')),
})
```

`within` resolves the child inside the parent locator and returns the child. This is not `filter({ has })`. To get the container that holds an element, use plain Playwright: `page.getByRole('row').filter({ has: ... })`.

## Overlay handlers

`pom.when(trigger).do(action)` wraps `page.addLocatorHandler`. `bind()` registers the handlers listed in `handles`.

```ts
const dismissCookies = pom
  .when(pom.dialog('Cookies'))
  .do(pom.click(pom.button('Reject all')))

const home = pom.page({
  handles: [dismissCookies],
  search: pom.searchbox('Search'),
})
```

The action resolves inside the trigger locator. The button must be a descendant of the trigger, so make the trigger the overlay container, not a text node beside it. Register each handler once per page. Each `bind` call adds the handler again.

## Generate from an ARIA snapshot

```ts
const snapshot = await page.locator('main').ariaSnapshot()
const model = await pom.page(pom.from(snapshot)).bind(page)
await model.main.Go.click()
```

- Keys are the accessible name, or the role when the element has no name. Keys are cut to 40 characters.
- Duplicate names become `More`, `More 2`, ... and resolve with `.nth(i)`.
- Containers (`navigation`, `main`, `list`, ...) become groups scoped to that container. `$` is the container itself.
- `text:` nodes become `pom.text`. `/url` and other props are ignored.
- The result is `Record<string, Def<any>>`, so keys are untyped. Use `from` to bootstrap. To get type safety, copy the result into a hand-written `pom.page({...})`.

Workflow for a new page: run `npx playwright test --debug` or a script that prints `await page.ariaSnapshot()`. Then turn the stable parts into an explicit `pom.page` with readable keys.

## Fixtures

```ts
import { test as base } from '@playwright/test'
import { pom } from '@pomkit/pompom'

const loginPage = pom.page({ submit: pom.button('Log in') })
type LoginModel = Awaited<ReturnType<typeof loginPage.bind>>

export const test = base.extend<{ loginPage: LoginModel }>({
  loginPage: async ({ page }, use) => use(await loginPage.bind(page)),
})
export { expect } from '@playwright/test'
```

## Types

```ts
import type { Def, Ctx, InferPOM, POMHandler } from '@pomkit/pompom'
type Model = Awaited<ReturnType<typeof loginPage.bind>>
```

To write your own factory, return a `Def<Locator>`:

```ts
const field =
  (label: string): Def<Locator> =>
  (ctx) =>
    ctx.getByLabel(label)
```

## Gotchas

- `pom.text` takes an object, not a string. `pom.locator` takes only a selector, with no options.
- Version 0.1.0 has two type bugs that later releases fix. `{ label }`, `{ selector }`, `{ testId }` and `{ text }` fail with TS2353, and `pom.page({ handles })` fails with TS2345. Both work at runtime. Check the installed version. On 0.1.0, use `pom.testId`, `pom.text`, `pom.locator` or a custom `Def`, or upgrade.

## Debugging

- Wrong or multiple elements: run `await model.x.count()` or `await model.x.highlight()`. Strict-mode errors mean the name is not unique, so add `exact: true` or a `within` scope.
- Handler never fires: check that the action target is inside the trigger and that the trigger becomes visible.
- `from()` throws `Failed to parse ARIA snapshot`: pass the raw string from `ariaSnapshot()` and keep its indentation.
