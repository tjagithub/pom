import type { Locator, Page } from 'playwright/test'
import type {
  POMParams,
  Def,
  Ctx,
  InferPOM,
  POMHandler,
} from './core'

// Playwright type aliases for type-safe factory functions
type GetByRoleType = Parameters<Page['getByRole']>[0]
type GetByRoleOptions = Parameters<Page['getByRole']>[1]
type LocatorOptions = Parameters<Page['locator']>[1]

// Valid ARIA roles for type safety
const ARIA_ROLES = [
  'button', 'textbox', 'checkbox', 'radio', 'link', 'combobox', 'menu', 'menuitem',
  'grid', 'row', 'cell', 'columnheader', 'rowheader', 'table', 'dialog', 'alert',
  'alertdialog', 'application', 'article', 'banner', 'blockquote', 'caption', 'code',
  'complementary', 'contentinfo', 'definition', 'deletion', 'directory', 'document',
  'emphasis', 'feed', 'figure', 'form', 'generic', 'gridcell', 'group', 'heading',
  'img', 'insertion', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math',
  'meter', 'menubar', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none',
  'note', 'option', 'paragraph', 'presentation', 'progressbar', 'radiogroup', 'region',
  'rowgroup', 'scrollbar', 'search', 'searchbox', 'separator', 'slider', 'spinbutton',
  'status', 'strong', 'subscript', 'superscript', 'switch', 'tab', 'tablist',
  'tabpanel', 'term', 'time', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
] as const

type ValidAriaRole = typeof ARIA_ROLES[number]

// Element config that supports multiple locator strategies
export type ElementConfig = {
  name?: string | RegExp
  label?: string | RegExp
  selector?: string
  testId?: string
  text?: string
  role?: string
} & Partial<GetByRoleOptions> & Partial<{
  exact?: boolean  // for getByText
}>

// Helper for string shorthand - convert string to ElementConfig
function toConfig(params: ElementConfig | string | undefined): ElementConfig {
  if (typeof params === 'string') return { name: params }
  return params || {}
}

// Helper to create element Def that supports multiple locator strategies
function elemDef(role: ValidAriaRole, params?: ElementConfig | string): Def<Locator> {
  const config = toConfig(params)
  return (ctx: Ctx) => {
    // CSS selector - pass options if provided
    if (config.selector) {
      const { selector, ...locOpts } = config
      const opts = Object.keys(locOpts).length ? locOpts as LocatorOptions : undefined
      return ctx.locator(selector, opts)
    }

    // Test ID
    if (config.testId) return ctx.getByTestId(config.testId)

    // Label - support exact option
    if (config.label !== undefined) {
      const { label, exact } = config
      const opts = exact !== undefined ? { exact } : undefined
      return ctx.getByLabel(label, opts)
    }

    // Text - support exact option
    if (config.text) {
      const { text, exact } = config
      // Playwright expects exact as part of options object
      const opts = exact !== undefined ? { exact } : undefined
      return ctx.getByText(text, opts)
    }

    // Default to getByRole with proper options
    const { name, selector, testId, label, text, role: _, ...roleOpts } = config
    const opts = name ? { name, ...roleOpts } : (Object.keys(roleOpts).length ? roleOpts : undefined)
    return ctx.getByRole(role as GetByRoleType, opts as GetByRoleOptions)
  }
}

export const pom = {
  // === Element Factories (return Def<Locator>) ===
  button: (params?: POMParams | string): Def<Locator> => elemDef('button', params),
  textbox: (params?: POMParams | string): Def<Locator> => elemDef('textbox', params),
  checkbox: (params?: POMParams | string): Def<Locator> => elemDef('checkbox', params),
  radio: (params?: POMParams | string): Def<Locator> => elemDef('radio', params),
  link: (params?: POMParams | string): Def<Locator> => elemDef('link', params),
  combobox: (params?: POMParams | string): Def<Locator> => elemDef('combobox', params),
  menu: (params?: POMParams | string): Def<Locator> => elemDef('menu', params),
  menuitem: (params?: POMParams | string): Def<Locator> => elemDef('menuitem', params),
  grid: (params?: POMParams | string): Def<Locator> => elemDef('grid', params),
  row: (params?: POMParams | string): Def<Locator> => elemDef('row', params),
  cell: (params?: POMParams | string): Def<Locator> => elemDef('cell', params),
  columnheader: (params?: POMParams | string): Def<Locator> => elemDef('columnheader', params),
  rowheader: (params?: POMParams | string): Def<Locator> => elemDef('rowheader', params),
  table: (params?: POMParams | string): Def<Locator> => elemDef('table', params),
  dialog: (params?: POMParams | string): Def<Locator> => elemDef('dialog', params),
  alert: (params?: POMParams | string): Def<Locator> => elemDef('alert', params),
  alertdialog: (params?: POMParams | string): Def<Locator> => elemDef('alertdialog', params),
  application: (params?: POMParams | string): Def<Locator> => elemDef('application', params),
  article: (params?: POMParams | string): Def<Locator> => elemDef('article', params),
  banner: (params?: POMParams | string): Def<Locator> => elemDef('banner', params),
  blockquote: (params?: POMParams | string): Def<Locator> => elemDef('blockquote', params),
  caption: (params?: POMParams | string): Def<Locator> => elemDef('caption', params),
  code: (params?: POMParams | string): Def<Locator> => elemDef('code', params),
  complementary: (params?: POMParams | string): Def<Locator> => elemDef('complementary', params),
  contentinfo: (params?: POMParams | string): Def<Locator> => elemDef('contentinfo', params),
  definition: (params?: POMParams | string): Def<Locator> => elemDef('definition', params),
  deletion: (params?: POMParams | string): Def<Locator> => elemDef('deletion', params),
  directory: (params?: POMParams | string): Def<Locator> => elemDef('directory', params),
  document: (params?: POMParams | string): Def<Locator> => elemDef('document', params),
  emphasis: (params?: POMParams | string): Def<Locator> => elemDef('emphasis', params),
  feed: (params?: POMParams | string): Def<Locator> => elemDef('feed', params),
  figure: (params?: POMParams | string): Def<Locator> => elemDef('figure', params),
  form: (params?: POMParams | string): Def<Locator> => elemDef('form', params),
  generic: (params?: POMParams | string): Def<Locator> => elemDef('generic', params),
  gridcell: (params?: POMParams | string): Def<Locator> => elemDef('gridcell', params),
  ariaGroup: (params?: POMParams | string): Def<Locator> => elemDef('group', params),
  heading: (params?: POMParams | string): Def<Locator> => elemDef('heading', params),
  img: (params?: POMParams | string): Def<Locator> => elemDef('img', params),
  insertion: (params?: POMParams | string): Def<Locator> => elemDef('insertion', params),
  list: (params?: POMParams | string): Def<Locator> => elemDef('list', params),
  listbox: (params?: POMParams | string): Def<Locator> => elemDef('listbox', params),
  listitem: (params?: POMParams | string): Def<Locator> => elemDef('listitem', params),
  log: (params?: POMParams | string): Def<Locator> => elemDef('log', params),
  main: (params?: POMParams | string): Def<Locator> => elemDef('main', params),
  marquee: (params?: POMParams | string): Def<Locator> => elemDef('marquee', params),
  math: (params?: POMParams | string): Def<Locator> => elemDef('math', params),
  meter: (params?: POMParams | string): Def<Locator> => elemDef('meter', params),
  menubar: (params?: POMParams | string): Def<Locator> => elemDef('menubar', params),
  menuitemcheckbox: (params?: POMParams | string): Def<Locator> => elemDef('menuitemcheckbox', params),
  menuitemradio: (params?: POMParams | string): Def<Locator> => elemDef('menuitemradio', params),
  navigation: (params?: POMParams | string): Def<Locator> => elemDef('navigation', params),
  none: (params?: POMParams | string): Def<Locator> => elemDef('none', params),
  note: (params?: POMParams | string): Def<Locator> => elemDef('note', params),
  option: (params?: POMParams | string): Def<Locator> => elemDef('option', params),
  paragraph: (params?: POMParams | string): Def<Locator> => elemDef('paragraph', params),
  presentation: (params?: POMParams | string): Def<Locator> => elemDef('presentation', params),
  progressbar: (params?: POMParams | string): Def<Locator> => elemDef('progressbar', params),
  radiogroup: (params?: POMParams | string): Def<Locator> => elemDef('radiogroup', params),
  region: (params?: POMParams | string): Def<Locator> => elemDef('region', params),
  rowgroup: (params?: POMParams | string): Def<Locator> => elemDef('rowgroup', params),
  scrollbar: (params?: POMParams | string): Def<Locator> => elemDef('scrollbar', params),
  search: (params?: POMParams | string): Def<Locator> => elemDef('search', params),
  searchbox: (params?: POMParams | string): Def<Locator> => elemDef('searchbox', params),
  separator: (params?: POMParams | string): Def<Locator> => elemDef('separator', params),
  slider: (params?: POMParams | string): Def<Locator> => elemDef('slider', params),
  spinbutton: (params?: POMParams | string): Def<Locator> => elemDef('spinbutton', params),
  status: (params?: POMParams | string): Def<Locator> => elemDef('status', params),
  strong: (params?: POMParams | string): Def<Locator> => elemDef('strong', params),
  subscript: (params?: POMParams | string): Def<Locator> => elemDef('subscript', params),
  superscript: (params?: POMParams | string): Def<Locator> => elemDef('superscript', params),
  switch: (params?: POMParams | string): Def<Locator> => elemDef('switch', params),
  tab: (params?: POMParams | string): Def<Locator> => elemDef('tab', params),
  tablist: (params?: POMParams | string): Def<Locator> => elemDef('tablist', params),
  tabpanel: (params?: POMParams | string): Def<Locator> => elemDef('tabpanel', params),
  term: (params?: POMParams | string): Def<Locator> => elemDef('term', params),
  time: (params?: POMParams | string): Def<Locator> => elemDef('time', params),
  timer: (params?: POMParams | string): Def<Locator> => elemDef('timer', params),
  toolbar: (params?: POMParams | string): Def<Locator> => elemDef('toolbar', params),
  tooltip: (params?: POMParams | string): Def<Locator> => elemDef('tooltip', params),
  tree: (params?: POMParams | string): Def<Locator> => elemDef('tree', params),
  treegrid: (params?: POMParams | string): Def<Locator> => elemDef('treegrid', params),
  treeitem: (params?: POMParams | string): Def<Locator> => elemDef('treeitem', params),

  // === New Factories ===
  text(config: { text: string; exact?: boolean }): Def<Locator> {
    const { text, exact } = config
    const opts = exact !== undefined ? { exact } : undefined
    return (ctx: Ctx) => ctx.getByText(text, opts)
  },

  locator(selector: string): Def<Locator> {
    return (ctx: Ctx) => ctx.locator(selector)
  },

  testId(id: string): Def<Locator> {
    return (ctx: Ctx) => ctx.getByTestId(id)
  },

  click(def: Def<Locator>): Def<unknown> {
    return async (ctx: Ctx) => {
      const loc = def(ctx)
      await loc.click()
    }
  },

  // === Group (user snippet for logical nesting) ===
  group<T extends Record<string, Def<any>>>(shape: T): Def<{
    [K in keyof T]: ReturnType<T[K]>
  }> {
    return (ctx: Ctx) => {
      const result: any = {}
      for (const key in shape) {
        result[key] = shape[key](ctx)
      }
      return result
    }
  },

  // === Within (user snippet for scoping) ===
  // Returns the CHILD locator scoped to the parent (not the parent itself)
  within(parent: Def<Locator>, child: Def<Locator>): Def<Locator> {
    return (ctx: Ctx) => {
      const parentLoc = parent(ctx)
      // Child gets parent as context for scoping
      return child(parentLoc)
    }
  },

  // === And & Or (user snippets - delegate to Playwright) ===
  and(a: Def<Locator>, b: Def<Locator>): Def<Locator> {
    return (ctx: Ctx) => {
      const A = a(ctx)
      const B = b(ctx)
      return A.and(B)
    }
  },

  or(a: Def<Locator>, b: Def<Locator>): Def<Locator> {
    return (ctx: Ctx) => {
      const A = a(ctx)
      const B = b(ctx)
      return A.or(B)
    }
  },

  // === When/Do for reusable handlers ===
  when(trigger: Def<Locator>): { do: (action: Def<unknown>) => POMHandler } {
    return {
      do: (action: Def<unknown>): POMHandler => ({
        trigger,
        action: async (triggerLoc: Locator) => {
          await action(triggerLoc as any)
        }
      })
    }
  },

  // === Page definition ===
  page<T extends Record<string, Def<any>>>(
    config: T & { handles?: POMHandler[] }
  ): { bind: (page: Page) => Promise<InferPOM<T>> } {
    return {
      bind: async (page: Page) => {
        // 1. Register all handlers concurrently (Promise.all per user request)
        const handles = (config as any).handles
        if (handles) {
          await Promise.all(
            handles.map(async (handler: POMHandler) => {
              const triggerLoc = handler.trigger(page)
              await page.addLocatorHandler(triggerLoc, () => handler.action(triggerLoc))
            })
          )
        }

        // 2. Resolve all locators
        const result: Record<string, unknown> = {}
        for (const key in config) {
          if (key === 'handles') continue
          const def = (config as any)[key] as Def<any>
          result[key] = def(page)
        }

        return result as InferPOM<T>
      }
    }
  },

  // === From ARIA Snapshot ===
  from(snapshot: string): Record<string, Def<any>> {
    try {
      const lines = snapshot.split('\n')
      const root: AriaNode = { role: 'root', children: [], indent: -1 }

      for (const line of lines) {
        if (!line.trim()) continue
        const indent = line.search(/\S/)
        const node = parseAriaLine(line.trim())

        // Find parent: walk up to find node with indent < current indent
        let parent = root
        for (let i = root.children.length - 1; i >= 0; i--) {
          const candidate = root.children[i]
          if (candidate.indent < indent) {
            parent = candidate
            break
          }
        }

        node.indent = indent
        parent.children.push(node)
      }

      // Remove the root wrapper, return top-level children as record
      const result: Record<string, Def<any>> = {}
      for (const child of root.children) {
        const key = child.name || child.role
        result[key] = fromAriaNode(child)
      }
      return result
    } catch (error) {
      throw new Error(`Failed to parse ARIA snapshot: ${error instanceof Error ? error.message : String(error)}`)
    }
  },
}

// ARIA node representation
interface AriaNode {
  role: string
  name?: string
  url?: string
  text?: string
  children: AriaNode[]
  indent: number
}

function parseAriaLine(line: string): AriaNode {
  const node: AriaNode = { role: '', children: [], indent: 0 }

  // Check for url: - /url: https://...
  const urlMatch = line.match(/^\- \/url: (.+)$/)
  if (urlMatch) {
    node.role = 'link'
    node.url = urlMatch[1]
    return node
  }

  // Check for text: - text: Images
  const textMatch = line.match(/^\- text: (.+)$/)
  if (textMatch) {
    node.role = 'text'
    node.text = textMatch[1]
    return node
  }

  // Check for role with name: - link "Gmail":
  const roleNameMatch = line.match(/^\- (\w+) "([^"]+)":?$/)
  if (roleNameMatch) {
    node.role = roleNameMatch[1]
    node.name = roleNameMatch[2]
    return node
  }

  // Check for simple role: - img: or - button:
  const simpleRole = line.match(/^\- (\w+):?$/)
  if (simpleRole) {
    node.role = simpleRole[1]
    return node
  }

  return node
}

function fromAriaNode(node: AriaNode): Def<any> {
  // Handle nodes with children (groups)
  if (node.children.length > 0) {
    const shape: Record<string, Def<any>> = {}
    for (const child of node.children) {
      const key = child.name || child.role || 'unknown'
      shape[key] = fromAriaNode(child)
    }
    return pom.group(shape)
  }

  // Map ARIA roles to pom factories
  switch (node.role) {
    case 'button':
      return pom.button({ name: node.name || '' })
    case 'link':
      return pom.link({ name: node.name || '' })
    case 'img':
      return pom.img({ name: node.name || '' })
    case 'combobox':
      return pom.combobox({ name: node.name || '' })
    case 'search':
      return pom.search({ name: node.name || '' })
    case 'navigation':
      return pom.navigation({ name: node.name || '' })
    case 'contentinfo':
      return pom.contentinfo({ name: node.name || '' })
    case 'text':
      return pom.text({ text: node.text || node.name || '' })
    default:
      if (node.name) return pom.text({ text: node.name })
      return pom.locator(`[role="${node.role}"]`)
  }
}

export type { POMParams }
