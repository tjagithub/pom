import type { Locator, Page } from '@playwright/test'

// Context for resolving descriptors: top-level is Page, nested is parent Locator
export type Ctx = Page | Locator

// Descriptor: takes context, returns resolved value (sync, Playwright locator creation is sync)
export type Def<T> = (ctx: Ctx) => T

// Logical group for nesting
export class POMGroup<T extends Record<string, Def<any>>> {
  readonly type = 'pom-group'
  children: T
  constructor(children: T) {
    this.children = children
  }
}

// Union of all descriptors
export type POMDescriptor = POMElement | POMGroup<any>

// Zod-style type inference for nested POM structures
export type InferPOM<T> = T extends Def<infer U>
  ? U
  : T extends Record<string, any>
    ? { [K in keyof T]: InferPOM<T[K]> }
    : never

// Reusable handler type for pom.when().do()
export interface POMHandler {
  trigger: Def<Locator>
  action: (triggerLoc: Locator) => Promise<void>
}

export type RoleOptions = {
  checked?: boolean
  disabled?: boolean
  exact?: boolean
  expanded?: boolean
  includeHidden?: boolean
  level?: number
  name?: string | RegExp
  pressed?: boolean
  selected?: boolean
}

export type POMParams = Partial<RoleOptions>

export class POMElement {
  role: string
  options: RoleOptions
  constructor(role: string, options: RoleOptions = {}) {
    this.role = role
    this.options = options
  }
}

export class Button extends POMElement {
  constructor(options: POMParams = {}) {
    super('button', options)
  }
}

export class Textbox extends POMElement {
  constructor(options: POMParams = {}) {
    super('textbox', options)
  }
}

export class Checkbox extends POMElement {
  constructor(options: POMParams = {}) {
    super('checkbox', options)
  }
}

export class Radio extends POMElement {
  constructor(options: POMParams = {}) {
    super('radio', options)
  }
}

export class Link extends POMElement {
  constructor(options: POMParams = {}) {
    super('link', options)
  }
}

export class Combobox extends POMElement {
  constructor(options: POMParams = {}) {
    super('combobox', options)
  }
}

export class Menu extends POMElement {
  constructor(options: POMParams = {}) {
    super('menu', options)
  }
}

export class Menuitem extends POMElement {
  constructor(options: POMParams = {}) {
    super('menuitem', options)
  }
}

export class Grid extends POMElement {
  constructor(options: POMParams = {}) {
    super('grid', options)
  }
}

export class Row extends POMElement {
  constructor(options: POMParams = {}) {
    super('row', options)
  }
}

export class Cell extends POMElement {
  constructor(options: POMParams = {}) {
    super('cell', options)
  }
}

export class Columnheader extends POMElement {
  constructor(options: POMParams = {}) {
    super('columnheader', options)
  }
}

export class Rowheader extends POMElement {
  constructor(options: POMParams = {}) {
    super('rowheader', options)
  }
}

export class Table extends POMElement {
  constructor(options: POMParams = {}) {
    super('table', options)
  }
}

export class Dialog extends POMElement {
  constructor(options: POMParams = {}) {
    super('dialog', options)
  }
}

export class Alert extends POMElement {
  constructor(options: POMParams = {}) {
    super('alert', options)
  }
}

export class Alertdialog extends POMElement {
  constructor(options: POMParams = {}) {
    super('alertdialog', options)
  }
}

export class Application extends POMElement {
  constructor(options: POMParams = {}) {
    super('application', options)
  }
}

export class Article extends POMElement {
  constructor(options: POMParams = {}) {
    super('article', options)
  }
}

export class Banner extends POMElement {
  constructor(options: POMParams = {}) {
    super('banner', options)
  }
}

export class Blockquote extends POMElement {
  constructor(options: POMParams = {}) {
    super('blockquote', options)
  }
}

export class Caption extends POMElement {
  constructor(options: POMParams = {}) {
    super('caption', options)
  }
}

export class Code extends POMElement {
  constructor(options: POMParams = {}) {
    super('code', options)
  }
}

export class Complementary extends POMElement {
  constructor(options: POMParams = {}) {
    super('complementary', options)
  }
}

export class Contentinfo extends POMElement {
  constructor(options: POMParams = {}) {
    super('contentinfo', options)
  }
}

export class Definition extends POMElement {
  constructor(options: POMParams = {}) {
    super('definition', options)
  }
}

export class Deletion extends POMElement {
  constructor(options: POMParams = {}) {
    super('deletion', options)
  }
}

export class Directory extends POMElement {
  constructor(options: POMParams = {}) {
    super('directory', options)
  }
}

export class Document extends POMElement {
  constructor(options: POMParams = {}) {
    super('document', options)
  }
}

export class Emphasis extends POMElement {
  constructor(options: POMParams = {}) {
    super('emphasis', options)
  }
}

export class Feed extends POMElement {
  constructor(options: POMParams = {}) {
    super('feed', options)
  }
}

export class Figure extends POMElement {
  constructor(options: POMParams = {}) {
    super('figure', options)
  }
}

export class Form extends POMElement {
  constructor(options: POMParams = {}) {
    super('form', options)
  }
}

export class Generic extends POMElement {
  constructor(options: POMParams = {}) {
    super('generic', options)
  }
}

export class Gridcell extends POMElement {
  constructor(options: POMParams = {}) {
    super('gridcell', options)
  }
}

export class Group extends POMElement {
  constructor(options: POMParams = {}) {
    super('group', options)
  }
}

export class Heading extends POMElement {
  constructor(options: POMParams = {}) {
    super('heading', options)
  }
}

export class Img extends POMElement {
  constructor(options: POMParams = {}) {
    super('img', options)
  }
}

export class Insertion extends POMElement {
  constructor(options: POMParams = {}) {
    super('insertion', options)
  }
}

export class List extends POMElement {
  constructor(options: POMParams = {}) {
    super('list', options)
  }
}

export class Listbox extends POMElement {
  constructor(options: POMParams = {}) {
    super('listbox', options)
  }
}

export class Listitem extends POMElement {
  constructor(options: POMParams = {}) {
    super('listitem', options)
  }
}

export class Log extends POMElement {
  constructor(options: POMParams = {}) {
    super('log', options)
  }
}

export class Main extends POMElement {
  constructor(options: POMParams = {}) {
    super('main', options)
  }
}

export class Marquee extends POMElement {
  constructor(options: POMParams = {}) {
    super('marquee', options)
  }
}

export class Math extends POMElement {
  constructor(options: POMParams = {}) {
    super('math', options)
  }
}

export class Meter extends POMElement {
  constructor(options: POMParams = {}) {
    super('meter', options)
  }
}

export class Menubar extends POMElement {
  constructor(options: POMParams = {}) {
    super('menubar', options)
  }
}

export class Menuitemcheckbox extends POMElement {
  constructor(options: POMParams = {}) {
    super('menuitemcheckbox', options)
  }
}

export class Menuitemradio extends POMElement {
  constructor(options: POMParams = {}) {
    super('menuitemradio', options)
  }
}

export class Navigation extends POMElement {
  constructor(options: POMParams = {}) {
    super('navigation', options)
  }
}

export class None extends POMElement {
  constructor(options: POMParams = {}) {
    super('none', options)
  }
}

export class Note extends POMElement {
  constructor(options: POMParams = {}) {
    super('note', options)
  }
}

export class Option extends POMElement {
  constructor(options: POMParams = {}) {
    super('option', options)
  }
}

export class Paragraph extends POMElement {
  constructor(options: POMParams = {}) {
    super('paragraph', options)
  }
}

export class Presentation extends POMElement {
  constructor(options: POMParams = {}) {
    super('presentation', options)
  }
}

export class Progressbar extends POMElement {
  constructor(options: POMParams = {}) {
    super('progressbar', options)
  }
}

export class Radiogroup extends POMElement {
  constructor(options: POMParams = {}) {
    super('radiogroup', options)
  }
}

export class Region extends POMElement {
  constructor(options: POMParams = {}) {
    super('region', options)
  }
}

export class Rowgroup extends POMElement {
  constructor(options: POMParams = {}) {
    super('rowgroup', options)
  }
}

export class Scrollbar extends POMElement {
  constructor(options: POMParams = {}) {
    super('scrollbar', options)
  }
}

export class Search extends POMElement {
  constructor(options: POMParams = {}) {
    super('search', options)
  }
}

export class Searchbox extends POMElement {
  constructor(options: POMParams = {}) {
    super('searchbox', options)
  }
}

export class Separator extends POMElement {
  constructor(options: POMParams = {}) {
    super('separator', options)
  }
}

export class Slider extends POMElement {
  constructor(options: POMParams = {}) {
    super('slider', options)
  }
}

export class Spinbutton extends POMElement {
  constructor(options: POMParams = {}) {
    super('spinbutton', options)
  }
}

export class Status extends POMElement {
  constructor(options: POMParams = {}) {
    super('status', options)
  }
}

export class Strong extends POMElement {
  constructor(options: POMParams = {}) {
    super('strong', options)
  }
}

export class Subscript extends POMElement {
  constructor(options: POMParams = {}) {
    super('subscript', options)
  }
}

export class Superscript extends POMElement {
  constructor(options: POMParams = {}) {
    super('superscript', options)
  }
}

export class Switch extends POMElement {
  constructor(options: POMParams = {}) {
    super('switch', options)
  }
}

export class Tab extends POMElement {
  constructor(options: POMParams = {}) {
    super('tab', options)
  }
}

export class Tablist extends POMElement {
  constructor(options: POMParams = {}) {
    super('tablist', options)
  }
}

export class Tabpanel extends POMElement {
  constructor(options: POMParams = {}) {
    super('tabpanel', options)
  }
}

export class Term extends POMElement {
  constructor(options: POMParams = {}) {
    super('term', options)
  }
}

export class Time extends POMElement {
  constructor(options: POMParams = {}) {
    super('time', options)
  }
}

export class Timer extends POMElement {
  constructor(options: POMParams = {}) {
    super('timer', options)
  }
}

export class Toolbar extends POMElement {
  constructor(options: POMParams = {}) {
    super('toolbar', options)
  }
}

export class Tooltip extends POMElement {
  constructor(options: POMParams = {}) {
    super('tooltip', options)
  }
}

export class Tree extends POMElement {
  constructor(options: POMParams = {}) {
    super('tree', options)
  }
}

export class Treegrid extends POMElement {
  constructor(options: POMParams = {}) {
    super('treegrid', options)
  }
}

export class Treeitem extends POMElement {
  constructor(options: POMParams = {}) {
    super('treeitem', options)
  }
}