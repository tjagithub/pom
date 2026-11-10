import { parse } from 'yaml'

export interface AriaNode {
  role: string
  name?: string | RegExp
  attrs: Record<string, string | number | boolean>
  text?: string
  children: AriaNode[]
}

// Key shapes Playwright emits: `role`, `role "name"`, `role /re/i`, then `[attr]` or `[attr=v]`
const KEY = /^([\w-]+)(?: ("(?:[^"\\]|\\.)*"|\/.*\/[a-z]*))?((?: \[[^\]]+\])*)$/

function parseKey(key: string): AriaNode | undefined {
  const m = KEY.exec(key.trim())
  if (!m) return undefined
  const node: AriaNode = { role: m[1], attrs: {}, children: [] }
  if (m[2]?.startsWith('"')) node.name = JSON.parse(m[2])
  else if (m[2]) {
    const i = m[2].lastIndexOf('/')
    node.name = new RegExp(m[2].slice(1, i), m[2].slice(i + 1))
  }
  for (const [, k, v] of m[3].matchAll(/\[(\w+)(?:=([^\]]+))?\]/g)) {
    node.attrs[k] = v === undefined ? true : /^\d+$/.test(v) ? Number(v) : v
  }
  return node
}

function parseItem(item: unknown): AriaNode | undefined {
  if (typeof item === 'string') return parseKey(item)
  if (!item || typeof item !== 'object') return undefined
  const [key, value] = Object.entries(item)[0] ?? []
  if (key === undefined || key.startsWith('/')) return undefined // `/url`, `/placeholder`: not elements
  if (key === 'text') return { role: 'text', text: String(value ?? ''), attrs: {}, children: [] }
  const node = parseKey(key)
  if (!node) return undefined
  if (Array.isArray(value)) node.children = value.map(parseItem).filter((n): n is AriaNode => !!n)
  else if (value != null) node.text = String(value)
  return node
}

export function parseAria(snapshot: string): AriaNode[] {
  const doc = parse(snapshot)
  if (doc == null) return []
  if (!Array.isArray(doc)) throw new Error('expected a YAML list')
  return doc.map(parseItem).filter((n): n is AriaNode => !!n)
}

const MAX_KEY = 40
const keyOf = (n: AriaNode): string => {
  const base = typeof n.name === 'string' ? n.name : n.name ? String(n.name) : n.role === 'text' ? 'text' : n.role
  return base.length > MAX_KEY ? `${base.slice(0, MAX_KEY - 1)}…` : base
}

const BOOLEAN_ATTRS = ['checked', 'disabled', 'expanded', 'pressed', 'selected']

// Text and /url children are content, not elements: only real element children make a container.
const isContainer = (n: AriaNode) => n.children.some((c) => c.role !== 'text')

type Def = (ctx: any) => any
export interface Factories {
  role: (role: string, config: Record<string, unknown>) => Def
  text: (text: string) => Def
}

// Sibling keys are made unique (`More`, `More 2`) and repeated role+name pairs get `.nth(i)`.
const INTERACTIVE = new Set([
  'button', 'link', 'textbox', 'searchbox', 'checkbox', 'radio', 'combobox', 'option', 'tab',
  'menuitem', 'menuitemcheckbox', 'menuitemradio', 'switch', 'slider', 'spinbutton',
])

// Interactive roles claim a plain name first; others on a clash get the role added (`Sign in heading`).
function assignKeys(nodes: AriaNode[]): string[] {
  const count = new Map<string, number>()
  const owner = new Map<string, string>()
  const out: string[] = []
  const order = nodes.map((_, i) => i).sort((a, b) => +!INTERACTIVE.has(nodes[a].role) - +!INTERACTIVE.has(nodes[b].role))
  for (const i of order) {
    const n = nodes[i]
    let base = keyOf(n)
    if (owner.has(base) && owner.get(base) !== n.role) base = `${base} ${n.role}`
    else owner.set(base, n.role)
    const seen = (count.get(base) ?? 0) + 1
    count.set(base, seen)
    out[i] = seen === 1 ? base : `${base} ${seen}`
  }
  return out
}

export function buildShape(all: AriaNode[], f: Factories, nested = false): Record<string, Def> {
  const nodes = nested ? all.filter((n) => n.role !== 'text') : all
  const keys = assignKeys(nodes)
  const same = new Map<string, number>()
  const total = new Map<string, number>()
  const sig = (n: AriaNode) => `${n.role}|${n.name}|${JSON.stringify(n.attrs)}`
  for (const n of nodes) total.set(sig(n), (total.get(sig(n)) ?? 0) + 1)

  const shape: Record<string, Def> = {}
  for (const [i, n] of nodes.entries()) {
    const key = keys[i]
    const idx = same.get(sig(n)) ?? 0
    same.set(sig(n), idx + 1)

    if (n.role === 'text') {
      shape[key] = f.text(n.text ?? '')
      continue
    }
    const config: Record<string, unknown> = {}
    if (n.name !== undefined) Object.assign(config, { name: n.name, exact: typeof n.name === 'string' })
    if (typeof n.attrs.level === 'number') config.level = n.attrs.level
    for (const a of BOOLEAN_ATTRS) if (a in n.attrs) config[a] = n.attrs[a]
    const make = f.role(n.role, config)
    const pick: Def = (total.get(sig(n)) ?? 0) > 1 ? (ctx) => make(ctx).nth(idx) : make
    if (!isContainer(n)) {
      shape[key] = pick
      continue
    }
    const inner = buildShape(n.children, f, true)
    shape[key] = (ctx) => {
      const self = pick(ctx)
      const out: Record<string, unknown> = { $: self }
      for (const k in inner) out[k] = inner[k](self)
      return out
    }
  }
  return shape
}
