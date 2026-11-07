import { createElement, type ComponentType } from 'react'
import { manifest, sduiComponentNames } from '@kaladan/diba-schema'
import * as Diba from '../index'
import { actionBlocks } from './blocks/actions'
import { choiceBlocks } from './blocks/choices'
import { containerBlocks } from './blocks/containers'
import { dateBlocks } from './blocks/dates'
import { structureBlocks } from './blocks/structure'
import { hintBlocks } from './blocks/hints'
import { inputBlocks } from './blocks/inputs'
import { ownBlocks } from './blocks/own'
import { fieldBlocks } from './blocks/fields'
import { pickerBlocks } from './blocks/pickers'
import { statusBlocks } from './blocks/status'
import { sixBlocks } from './blocks/six'
import type { Block, NodeContext } from './node'

/**
 * Every component the schema names: a
 * block per component, drawing the copied components the way the
 * admin writes them by hand. One file per group of the
 * schema surface, so a group's review reads one file — as the Flutter
 * renderer's are.
 */
export const draft3Blocks: Record<string, Block> = {
  ...actionBlocks,
  ...fieldBlocks,
  ...pickerBlocks,
  ...choiceBlocks,
  ...statusBlocks,
  ...containerBlocks,
  ...dateBlocks,
  ...structureBlocks,
  ...hintBlocks,
  ...inputBlocks,
  ...ownBlocks,
  ...sixBlocks,
}

/**
 * Every component here is a plain function, because ref is a plain prop — which
 * is the whole of the React 19 authoring pattern this library follows.
 */
function isComponent(value: unknown): value is ComponentType<Record<string, unknown>> {
  return typeof value === 'function'
}

/**
 * A block for a component whose props are its manifest's, one for one: props,
 * events and slots pass through by name. Every block has its own now (Stack,
 * Text and Image among them, in blocks/own.tsx), so this is the fallback for a
 * component given none.
 */
function passThrough(Component: ComponentType<Record<string, unknown>>): Block {
  const PassThrough = ({ node }: { node: NodeContext }) => {
    const props: Record<string, unknown> = { ...node.props, ...node.slots }
    for (const event of Object.keys(node.on)) {
      props[event] = (value: unknown) => void node.fire(event, value)
    }
    return createElement(
      Component,
      props,
      node.text ?? (node.children.length ? node.children : undefined),
    )
  }
  // Drawn in place rather than as a component of its own: a collection —
  // Tabs, Accordion, Breadcrumbs — reads its children's own elements, and a
  // wrapper around each would hide them.
  return Object.assign(PassThrough, { inline: true as const })
}

const exported = Diba as unknown as Record<string, unknown>

/**
 * Which block a `type` in a tree resolves to.
 *
 * The draft-3 blocks by name; everything else derived from the package's own
 * exports rather than written out, so a component added to the manifest and
 * forgotten here can only be missing by being missing from the package.
 */
export const registry: Record<string, Block> = Object.fromEntries(
  sduiComponentNames.flatMap((name) => {
    const block = draft3Blocks[name]
    if (block) return [[name, block]]
    const component = exported[name]
    return isComponent(component) ? [[name, passThrough(component)]] : []
  }),
)

/** Names the manifest calls SDUI-safe that this package cannot actually render. */
export const unrenderable: string[] = sduiComponentNames.filter((name) => !(name in registry))

/**
 * The props a component will accept from a tree, by name.
 *
 * Anything not declared in the manifest is dropped rather than forwarded —
 * `className` and `style` pass through on most of these components, and a tree
 * that could set them could reposition itself over the host, hide the chrome
 * around it, or paint itself to look like something it is not.
 */
export function allowedProps(type: string): Set<string> {
  return new Set(Object.keys(manifest.components[type]?.props ?? {}))
}

/** The events a component declares. An action on any other key is dropped. */
export function allowedActions(type: string): Set<string> {
  return new Set(Object.keys(manifest.components[type]?.actions ?? {}))
}

/** The named positions a component will take a node in. */
export function allowedSlots(type: string): Set<string> {
  return new Set(Object.keys(manifest.components[type]?.slots ?? {}))
}
