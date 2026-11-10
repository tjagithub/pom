# pompom

POM, twice: a Zod-style Page Object Model for Playwright.

A TypeScript library that mimics Zod's API to generate Page Object Models (POMs) for `@playwright/test`. Define your page elements once and get type-safe locators with a clean, chainable API.

## Installation

```bash
npm install pompom
# or
yarn add pompom
```

Peer dependencies (installed automatically with npm 7+):
- `@playwright/test: ^1.59.0`

## Core Concept

POM uses a **descriptor pattern** where element factories return `Def<Locator>` functions that resolve to Playwright locators when bound to a page.

```typescript
import { pom } from 'pompom'

// 1. Define your page structure
const loginPage = pom.page({
  username: pom.textbox({ label: 'Username' }),
  password: pom.textbox({ label: 'Password' }),
  submit: pom.button({ name: 'Submit' }),
})

// 2. Bind to a Playwright page (registers handlers, resolves locators)
const model = await loginPage.bind(page)

// 3. Use the locators
await model.username.fill('myuser')
await model.password.fill('mypass')
await model.submit.click()
```

## API Reference

### `pom.page(config) => { bind }`

Defines a page object. Returns an object with a `bind()` method.

```typescript
const pageDef = pom.page({
  // Element locators
  submit: pom.button({ name: 'Submit' }),
  
  // Logical groups (nested structures)
  form: pom.group({
    username: pom.textbox({ label: 'Username' }),
    password: pom.textbox({ label: 'Password' }),
  }),
  
  // Reusable handlers
  handles: [myHandler],
})

// Bind to page (async - registers handlers, resolves locators)
const model = await pageDef.bind(page)
```

### Element Factories

All factories return `Def<Locator>` and support multiple locator strategies:

#### ARIA Role Factories (50+ roles available)

```typescript
// Basic usage
pom.button({ name: 'Submit' })
pom.textbox({ label: 'Email' })
pom.link({ name: 'Click here' })
pom.checkbox({ name: 'Agree' })

// With options (uses Playwright's getByRole options)
pom.button({ name: 'Submit', disabled: true })
pom.heading({ level: 2 })
pom.textbox({ name: /email/i, exact: false })
```

**Available ARIA role factories:** `button`, `textbox`, `checkbox`, `radio`, `link`, `combobox`, `menu`, `menuitem`, `grid`, `row`, `cell`, `columnheader`, `rowheader`, `table`, `dialog`, `alert`, `alertdialog`, `application`, `article`, `banner`, `blockquote`, `caption`, `code`, `complementary`, `contentinfo`, `definition`, `deletion`, `directory`, `document`, `emphasis`, `feed`, `figure`, `form`, `generic`, `gridcell`, `ariaGroup` (ARIA group role), `heading`, `img`, `insertion`, `list`, `listbox`, `listitem`, `log`, `main`, `marquee`, `math`, `meter`, `menubar`, `menuitemcheckbox`, `menuitemradio`, `navigation`, `none`, `note`, `option`, `paragraph`, `presentation`, `progressbar`, `radiogroup`, `region`, `rowgroup`, `scrollbar`, `search`, `searchbox`, `separator`, `slider`, `spinbutton`, `status`, `strong`, `subscript`, `superscript`, `switch`, `tab`, `tablist`, `tabpanel`, `term`, `time`, `timer`, `toolbar`, `tooltip`, `tree`, `treegrid`, `treeitem`

#### String Shorthand

```typescript
// These are equivalent:
pom.button('Submit')
pom.button({ name: 'Submit' })
```

#### CSS Selector & Other Locators

```typescript
// CSS selector with options
pom.locator('.my-class')
pom.locator('.item', { hasText: 'Item 1' })

// Test ID
pom.testId('submit-btn')

// Text with exact option
pom.text('Hello World')
pom.text({ text: 'Hello', exact: true })

// Direct role access (ARIA group role - renamed to avoid conflict)
pom.ariaGroup({ name: 'Settings' })
```

### `pom.group(shape) => Def<Group>`

Creates logical groupings of elements (not an ARIA role):

```typescript
const pageDef = pom.page({
  form: pom.group({
    username: pom.textbox({ label: 'Username' }),
    password: pom.textbox({ label: 'Password' }),
  }),
  submit: pom.button({ name: 'Submit' }),
})

const model = await pageDef.bind(page)

// Access nested elements
await model.form.username.fill('user')
await model.form.password.fill('pass')
await model.submit.click()
```

### `pom.within(parent, child) => Def<Locator>`

Scopes a child locator to a parent (equivalent to Playwright's `filter({ has })`):

```typescript
// Equivalent to: page.locator('section').filter({ has: page.getByRole('button', { name: 'Click me' }) })
const scopedButton = pom.within(
  pom.locator('section'),
  pom.button({ name: 'Click me' })
)

// Scope elements inside a form
// Equivalent to: page.getByRole('form', { name: 'login' }).filter({
//   has: page.getByRole('button', { name: 'submit' }) 
// })
const submitInForm = pom.within(
  pom.form({ name: 'login' }),
  pom.button({ name: 'submit' })
)
```

### `pom.and(a, b) => Def<Locator>` & `pom.or(a, b) => Def<Locator>`

Combine locators (delegates to Playwright's `.and()` and `.or()`):

```typescript
// AND: Matches elements matching BOTH locators
const specificButton = pom.and(
  pom.button({ name: 'Subscribe' }),
  pom.locator('button[title="Newsletter"]')
)

// OR: Matches elements matching ONE or BOTH locators
const emailButton = pom.or(
  pom.button({ name: 'New email' }),
  pom.button({ name: 'Compose' })
)
```

### `pom.when(trigger).do(action) => POMHandler`

Creates reusable handlers for `page.addLocatorHandler()`:

```typescript
// Define a reusable handler
const dismissNewsletter = pom.when(pom.text('Sign up to the newsletter'))
  .do(pom.click(pom.button({ name: 'No thanks' })))

// Use in page definitions - handlers auto-register on bind()
const pageDef = pom.page({
  handles: [dismissNewsletter],
})

// Can reuse across multiple pages
const loginPage = pom.page({ handles: [dismissNewsletter] })
const dashboardPage = pom.page({ handles: [dismissNewsletter] })
```

**How it works:** When `pageDef.bind(page)` is called, all handlers in `handles` array are registered via `page.addLocatorHandler()`. They automatically run when the trigger locator appears.

### `pom.from(snapshot) => Record<string, Def<any>>`

Parses Playwright's ARIA snapshot text and generates a POM structure automatically:

```typescript
// Get ARIA snapshot from any page
const snapshot = await page.ariaSnapshot()

// Parse it into a POM structure
const pageDef = pom.from(snapshot)

// Bind and use
const model = await pom.page(pageDef).bind(page)
await model['Gmail'].click()  // If "Gmail" link was in snapshot
```

The snapshot is parsed as YAML, so anything `page.ariaSnapshot()` emits is accepted.

**How it maps:**
```
- button "Submit"          →  model.Submit        (exact-name button locator)
- heading "Hi" [level=2]   →  model.Hi            (attributes become role options)
- link "Gmail":            →  model.Gmail         (/url and text children are ignored)
    - /url: https://...
- text: Hello World        →  model.text          (pom.text('Hello World'))
- navigation:              →  model.navigation    (group scoped to the nav; `$` is the nav itself)
    - link "Home"             model.navigation.Home
```

- Keys are the accessible name (or the role if unnamed), cut to 40 characters.
- Repeated names get numbered keys (`More`, `More 2`) and resolve with `.nth(i)`.
- Children of a container are resolved inside it, so `Home` in a nav and `Home` in a footer never clash.

**Example with nested groups:**
```typescript
const snapshot = `
- navigation:
  - link "Gmail"
  - link "Images"
- contentinfo:
  - link "Privacy"
  - link "Terms"
`

const result = pom.from(snapshot)
// result.navigation → group with Gmail and Images
// result.contentinfo → group with Privacy and Terms
```

## Complete Example

```typescript
import { test, expect } from '@playwright/test'
import { pom } from 'pompom'

test('login page', async ({ page }) => {
  // Define page structure
  const loginPage = pom.page({
    form: pom.group({
      username: pom.textbox({ label: 'Username' }),
      password: pom.textbox({ label: 'Password' }),
    }),
    submit: pom.button({ name: 'Login' }),
    forgotPassword: pom.link({ name: 'Forgot password?' }),
  })

  // Bind to page
  const model = await loginPage.bind(page)

  // Use the locators
  await model.form.username.fill('myuser')
  await model.form.password.fill('mypass')
  await model.submit.click()

  // Type-safe access
  expect(model.form.username).toBeDefined()
})
```

## TypeScript Support

POM is written in TypeScript and provides full type inference:

```typescript
import type { InferPOM, Def, Ctx } from 'pom'

// Infer the shape of your page definition
const pageDef = pom.page({
  submit: pom.button({ name: 'Submit' }),
  form: pom.group({
    username: pom.textbox({ label: 'User' }),
  }),
})

type Model = Awaited<ReturnType<typeof pageDef.bind>>

// Model is typed as:
// {
//   submit: Locator
//   form: {
//     username: Locator
//   }
// }
```

## Building & Testing

```bash
# Build the library (ESM + CJS)
npm run build

# Type check
npm run typecheck

# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## Key Differences from Traditional POM

| Traditional POM | POM Library |
|----------------|--------------|
| Class-based, manual locator creation | Zod-style declarative API |
| Locators created in constructor | Deferred resolution with `.bind()` |
| No reuse of handlers | `pom.when().do()` for reusable handlers |
| Manual ARIA snapshot parsing | `pom.from()` auto-parses snapshots |
| Limited type inference | Full TypeScript type inference |

## License

MIT
