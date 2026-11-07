import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { manifest } from '../dist/index'
import { validateTree } from '../dist/validate'
import { productCta } from './examples'

/**
 * The half of the trust boundary a renderer cannot cover.
 *
 * Every case here is well-formed JSON that reaches the renderer's own checks
 * and passes all of them, because the fault is in a *value* rather than in the
 * shape. The two are tested apart because they fail apart: the renderer's cases
 * live in `packages/react/src/sdui/sdui.test.tsx`, and nothing there overlaps
 * with anything here.
 */
describe('validateTree accepts what the contract allows', () => {
  it('the example tree the codegen is checked against', () => {
    expect(validateTree(productCta)).toEqual({ ok: true })
  })

  it('a node with no props or children at all', () => {
    expect(validateTree({ type: 'Separator' }).ok).toBe(true)
  })

  it('nesting, and text children where the manifest says text', () => {
    const tree = {
      type: 'Stack',
      props: { gap: 4 },
      children: [{ type: 'Text', props: { weight: 'bold' }, children: 'سلام' }],
    }
    expect(validateTree(tree).ok).toBe(true)
  })
})

describe('validateTree rejects what the renderer cannot see', () => {
  /**
   * The one that made this worth building. Both props are real Button props, so
   * the renderer forwards them and refuses nothing — and `tailwind-variants`
   * matches neither value, so the button comes out `button button--sm` with no
   * fill, no ink and no colour.
   */
  it('a declared prop holding a value the enum does not have', () => {
    const result = validateTree({
      type: 'Button',
      props: { variant: 'nonsense' },
      children: 'x',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.join('\n')).toMatch(/variant/)
    }
  })

  it('a prop given the wrong type', () => {
    expect(validateTree({ type: 'Text', props: { truncate: 'yes' } }).ok).toBe(false)
  })

  it('a prop the component does not have', () => {
    expect(validateTree({ type: 'Text', props: { onTap: 'x' } }).ok).toBe(false)
  })

  it('a component that does not exist', () => {
    expect(validateTree({ type: 'Malware' }).ok).toBe(false)
  })

  it('a component the manifest does not declare as a block', () => {
    // Box was a helper, never a block, and has left the kit.
    expect(validateTree({ type: 'Box' }).ok).toBe(false)
  })

  it('a toast as a block: it is a verb, not a node', () => {
    // Toast is a component an app draws, not a block a tree may name.
    expect(validateTree({ type: 'Toast' }).ok).toBe(false)
  })

  it('node children where the manifest says text', () => {
    const tree = { type: 'Text', children: [{ type: 'Text', children: 'x' }] }
    expect(validateTree(tree).ok).toBe(false)
  })

  it('an event the component does not declare', () => {
    const tree = {
      type: 'Text',
      children: 'x',
      actions: { onPress: { do: 'call', action: 'x' } },
    }
    expect(validateTree(tree).ok).toBe(false)
  })
})

/**
 * The action union, which was `do` plus anything until it was split per verb.
 * These are exactly the payloads that used to validate and then left the
 * renderer checking for fields the contract had already promised.
 */
describe('validateTree holds actions to one shape per verb', () => {
  const button = (action: unknown) => ({
    type: 'Button',
    children: 'x',
    actions: { onPress: action },
  })

  it('accepts each verb, fully formed', () => {
    expect(validateTree(button({ do: 'navigate', to: '/x' })).ok).toBe(true)
    expect(validateTree(button({ do: 'call', action: 'a.b' })).ok).toBe(true)
    expect(validateTree(button({ do: 'call', action: 'a.b', with: ['k'] })).ok).toBe(true)
    expect(validateTree(button({ do: 'setState', key: 'k' })).ok).toBe(true)
    expect(validateTree(button({ do: 'open', target: 't' })).ok).toBe(true)
    expect(validateTree(button({ do: 'call', action: 'a.b', value: 'item' })).ok).toBe(true)
    expect(validateTree(button({ do: 'close' })).ok).toBe(true)
    expect(validateTree(button({ do: 'toast', status: 'success', title: 'x' })).ok).toBe(true)
    expect(
      validateTree(
        button({
          do: 'toast',
          description: 'x',
          actionLabel: 'Undo',
          onAction: [{ do: 'call', action: 'undo' }, { do: 'close' }],
        }),
      ).ok,
    ).toBe(true)
  })

  it('accepts an ordered list: save, then close', () => {
    const list = [{ do: 'call', action: 'order.save', with: ['note'] }, { do: 'close' }]
    expect(validateTree(button(list)).ok).toBe(true)
  })

  it('rejects an empty list', () => {
    expect(validateTree(button([])).ok).toBe(false)
  })

  it('rejects a toast that says nothing', () => {
    expect(validateTree(button({ do: 'toast', status: 'success' })).ok).toBe(false)
  })

  it('rejects a toast in a status it does not have', () => {
    expect(validateTree(button({ do: 'toast', status: 'primary', title: 'x' })).ok).toBe(false)
  })

  it("rejects a toast inside a toast's undo", () => {
    const inner = { do: 'toast', title: 'again' }
    const toast = { do: 'toast', title: 'x', actionLabel: 'Undo' }
    expect(validateTree(button({ ...toast, onAction: inner })).ok).toBe(false)
    expect(validateTree(button({ ...toast, onAction: [{ do: 'close' }, inner] })).ok).toBe(false)
  })

  it('rejects an undo label with nothing to do, and the reverse', () => {
    expect(validateTree(button({ do: 'toast', title: 'x', actionLabel: 'Undo' })).ok).toBe(false)
    const onAction = { do: 'close' }
    expect(validateTree(button({ do: 'toast', title: 'x', onAction })).ok).toBe(false)
  })

  it('rejects a close carrying anything', () => {
    expect(validateTree(button({ do: 'close', target: 'x' })).ok).toBe(false)
  })

  it('rejects a navigate with nowhere to go', () => {
    expect(validateTree(button({ do: 'navigate' })).ok).toBe(false)
  })

  it('rejects a call with nothing to call', () => {
    expect(validateTree(button({ do: 'call' })).ok).toBe(false)
  })

  it('rejects a verb it does not have', () => {
    expect(validateTree(button({ do: 'eval', code: 'x' })).ok).toBe(false)
  })

  it('rejects a field riding along that no verb declares', () => {
    expect(validateTree(button({ do: 'setState', key: 'k', url: 'x' })).ok).toBe(false)
  })
})

describe('the reasons are usable', () => {
  it('points at the offending child, not the root', () => {
    const result = validateTree({
      type: 'Stack',
      children: [
        { type: 'Text', children: 'fine' },
        { type: 'Text', props: { size: 'enormous' }, children: 'bad' },
      ],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual([
        '/children/1/props/size must be equal to one of the allowed values',
      ])
    }
  })

  it('names an unknown component where it sits', () => {
    const result = validateTree({
      type: 'Stack',
      children: [{ type: 'Text', children: 'x' }, { type: 'Malware' }],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors).toEqual(['/children/1 unknown component: Malware'])
  })

  it('names where the fault is, once, not once per union branch', () => {
    const result = validateTree({ type: 'Text', props: { isMono: 'yes' } })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      // The union has 79 branches and Ajv reports every one it tried, so this
      // came back as fifteen lines before the walk was added — twelve of them
      // from Image, Kbd and Pagination, which the tree never mentioned.
      expect(result.errors).toEqual(['(root)/props/isMono must be boolean'])
    }
  })
})

/**
 * What a tree can say beyond its props' types, and the holes the schema
 * closes: a required prop inside an optional `props`, and child lists that
 * named their components without holding a tree to them.
 */
describe('validateTree holds the action lists, value pairs and slots', () => {
  it('a required prop is required even when props is left out', () => {
    expect(validateTree({ type: 'TextField' }).ok).toBe(false)
    expect(validateTree({ type: 'TextField', props: {} }).ok).toBe(false)
    expect(validateTree({ type: 'TextField', props: { label: 'Name' } }).ok).toBe(true)
  })

  it('an Alert says its status: it is required, not defaulted', () => {
    expect(validateTree({ type: 'Alert', props: { title: 'x' } }).ok).toBe(false)
    expect(validateTree({ type: 'Alert', props: { status: 'danger', title: 'x' } }).ok).toBe(true)
  })

  it('a list of keys is a list of strings', () => {
    const select = (keys: unknown) => ({
      type: 'Select',
      props: { label: 'x', selectionMode: 'multiple', defaultSelectedKeys: keys },
      children: [{ type: 'ListBoxItem', props: { id: 'a' }, children: 'A' }],
    })
    expect(validateTree(select(['a'])).ok).toBe(true)
    expect(validateTree(select('a')).ok).toBe(false)
    expect(validateTree(select([1])).ok).toBe(false)
  })

  it('a range is a pair of numbers, and a single value is a number', () => {
    const slider = (value: unknown) => ({
      type: 'Slider',
      props: { label: 'x', defaultValue: value },
    })
    expect(validateTree(slider(5)).ok).toBe(true)
    expect(validateTree(slider([10, 90])).ok).toBe(true)
    expect(validateTree(slider([10])).ok).toBe(false)
    expect(validateTree(slider([10, 50, 90])).ok).toBe(false)
    expect(validateTree(slider('5')).ok).toBe(false)
  })

  it('an icon is a name from the list', () => {
    const button = (icon: string) => ({ type: 'Button', props: { icon }, children: 'x' })
    expect(validateTree(button('trash-2')).ok).toBe(true)
    expect(validateTree(button('trash-3')).ok).toBe(false)
  })

  it('a child is one of the components its parent takes, and the reason says where', () => {
    const result = validateTree({
      type: 'Select',
      props: { label: 'x' },
      children: [{ type: 'Button', children: 'x' }],
    })
    expect(result).toEqual({
      ok: false,
      errors: [
        '/children/0 Button is not allowed here; this place takes ListBoxItem, ListBoxSection',
      ],
    })
  })

  it('a slot holds what it takes, and the reason says where', () => {
    const modal = (trigger: unknown) => ({
      type: 'Modal',
      props: { title: 'x' },
      slots: { trigger },
    })
    expect(validateTree(modal({ type: 'Button', children: 'Open' })).ok).toBe(true)
    const result = validateTree(modal({ type: 'Link', props: { href: '/x' }, children: 'Open' }))
    expect(result).toEqual({
      ok: false,
      errors: ['/slots/trigger Link is not allowed here; this place takes Button'],
    })
  })

  it('a node inside a slot is checked like any other', () => {
    const result = validateTree({
      type: 'Card',
      slots: { footer: { type: 'Text', props: { size: 'enormous' }, children: 'x' } },
    })
    expect(result).toEqual({
      ok: false,
      errors: ['/slots/footer/props/size must be equal to one of the allowed values'],
    })
  })

  it('a table cell holds text or blocks', () => {
    const table = (cell: unknown) => ({
      type: 'Table',
      props: { label: 'Orders' },
      children: [
        { type: 'TableBody', children: [{ type: 'Row', props: { id: 'r' }, children: [cell] }] },
      ],
    })
    expect(validateTree(table({ type: 'Cell', children: '۱۲' })).ok).toBe(true)
    const chip = { type: 'Chip', props: { color: 'success' }, children: 'پرداخت‌شده' }
    expect(validateTree(table({ type: 'Cell', children: [chip] })).ok).toBe(true)
  })

  it('a plain string is plain text, even one that reads like a URL', () => {
    // Validation is about shape. Which strings are URLs is the format's
    // business, and the renderers hold only those props to the URL rules.
    const tree = {
      type: 'TextField',
      props: { label: 'Warning: stock is low', defaultValue: 'javascript:alert(1)' },
    }
    expect(validateTree(tree).ok).toBe(true)
  })
})

describe('every sample tree in the Flutter gallery is a legal tree', () => {
  type Sample = { id: string; tree: unknown }
  type Group = { id: string; samples: Sample[] }
  const fixture = JSON.parse(
    readFileSync(new URL('../fixtures/samples.json', import.meta.url), 'utf8'),
  ) as Record<'fa' | 'en', Group[]>
  const count = (lang: 'fa' | 'en') => fixture[lang].flatMap((g) => g.samples).length

  it('has samples to check, the same number in both languages', () => {
    expect(count('fa')).toBeGreaterThan(20)
    expect(count('en')).toBe(count('fa'))
  })

  for (const lang of ['fa', 'en'] as const) {
    for (const group of fixture[lang]) {
      for (const sample of group.samples) {
        it(`${lang} · ${group.id} · ${sample.id}`, () => {
          expect(validateTree(sample.tree)).toEqual({ ok: true })
        })
      }
    }
  }
})

/**
 * URLs are guarded by prop: the renderers hold a prop to a URL rule
 * only when the manifest gives it a format. A URL prop that lost its format
 * would reach a renderer as plain text, checked by nothing, so the list is
 * pinned here rather than trusted to each entry.
 */
describe('every URL prop carries its format', () => {
  const formats = Object.values(manifest.components).flatMap((c) =>
    Object.entries(c.props ?? {})
      .filter(([, p]) => p.format)
      .map(([name, p]) => `${c.name}.${name}=${p.format}`),
  )

  it('the links and the pictures, exactly', () => {
    expect(formats.sort()).toEqual([
      'Avatar.src=image-url',
      // A step of a trail goes where it says.
      'BreadcrumbsItem.href=url',
      'Card.href=url',
      'Image.src=image-url',
      'Link.href=url',
      'LinkButton.href=url',
      'ListBoxItem.image=image-url',
      'Row.href=url',
      'Tag.href=url',
    ])
  })

  it('a prop named like a URL has a format', () => {
    const named = Object.values(manifest.components).flatMap((c) =>
      Object.entries(c.props ?? {})
        .filter(([name]) => /^(href|src|image|url)$/i.test(name))
        .filter(([, p]) => !p.format)
        .map(([name]) => `${c.name}.${name}`),
    )
    expect(named).toEqual([])
  })
})
