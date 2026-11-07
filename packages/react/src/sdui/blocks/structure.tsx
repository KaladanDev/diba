import { Accordion } from '../../components/accordion'
import { Description } from '../../components/description'
import { Drawer } from '../../components/drawer'
import { Fieldset } from '../../components/fieldset'
import { Separator } from '../../components/separator'
import { Tabs } from '../../components/tabs'
import type { Block } from '../node'
import { Icon, Nothing, propsOf, useSay } from './common'
import { OverlayScope } from './containers'
import { useToolbarSeparator } from './six'

/**
 * The extra components' structure: Tabs, an Accordion of disclosures, a Separator, a
 * Fieldset and a Drawer, drawing the copied components.
 */

/**
 * An icon before a tab's label or an item's title, [gap] from it: 12 and muted before a title, as
 * The original's own accordion draws one; 8 before a label, in the tab's colour.
 */
function Lead({ name, gap, muted }: { name: unknown; gap: number; muted?: boolean }) {
  if (typeof name !== 'string') return null
  return (
    <span
      data-slot="lead-icon"
      style={{
        display: 'inline-flex',
        flexShrink: 0,
        marginInlineEnd: gap,
        color: muted ? 'var(--muted)' : undefined,
      }}
    >
      <Icon name={name} />
    </span>
  )
}

/** A panel's or an item's blocks, 16 apart, as a Modal's body lays them out. */
const column = { display: 'flex', flexDirection: 'column', gap: 16 } as const

/**
 * Tabs > Tab, each Tab carrying its panel. React Aria wants the tab list and the panels apart, so
 * the block splits them; the first tab is chosen when the tree chooses none.
 */
const TabsBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const tabs = node.items.filter((item) => item.type === 'Tab')
  const first = tabs[0]?.props.id as string | undefined
  return (
    <Tabs
      variant={p.variant}
      isDisabled={p.isDisabled}
      selectedKey={(node.current as string | undefined) ?? first}
      onSelectionChange={(key) => void node.setValue('onChange', String(key))}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label={p.label}>
          {tabs.map((tab) => (
            <Tabs.Tab
              key={tab.path}
              id={tab.props.id as string}
              isDisabled={tab.props.isDisabled as boolean | undefined}
            >
              <Lead name={tab.props.icon} gap={8} />
              {tab.props.label as string}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.path} id={tab.props.id as string}>
          <div style={column}>{tab.items.map((item) => item.element)}</div>
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}

/** Accordion > AccordionItem: each item's title opens it, its blocks inside. */
const AccordionBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const items = node.items.filter((item) => item.type === 'AccordionItem')
  const open = (node.current as string[] | undefined) ?? []
  return (
    <Accordion
      variant={p.variant}
      allowsMultipleExpanded={p.allowsMultipleExpanded}
      isDisabled={p.isDisabled}
      expandedKeys={new Set(open)}
      onExpandedChange={(keys) => void node.setValue('onExpandedChange', [...keys].map(String))}
    >
      {items.map((item) => (
        <Accordion.Item
          key={item.path}
          id={item.props.id as string}
          isDisabled={item.props.isDisabled as boolean | undefined}
        >
          <Accordion.Heading>
            <Accordion.Trigger>
              <Lead name={item.props.icon} gap={12} muted />
              {item.props.title as string}
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>
              <div style={column}>{item.items.map((child) => child.element)}</div>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

const SeparatorBlock: Block = ({ node }) => {
  const p = propsOf(node)
  // In a Toolbar it runs across the toolbar, whatever the tree says.
  const across = useToolbarSeparator()
  return <Separator orientation={across ?? p.orientation} variant={p.variant} />
}

/** A titled group of fields: its legend, its help, then its fields. */
const FieldsetBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <Fieldset>
      <Fieldset.Legend>{p.legend}</Fieldset.Legend>
      {p.description ? <Description>{p.description}</Description> : null}
      <Fieldset.Group>{node.children}</Fieldset.Group>
    </Fieldset>
  )
}

/**
 * A drawer opened by its trigger, as a Modal is: its title, its blocks, its footer. Start and
 * end are the page's: start is the right edge in Persian.
 */
const DrawerBlock: Block = ({ node }) => {
  const p = propsOf(node)
  // Read here, not inside the drawer, which draws only while it is open.
  const { title, placement, backdrop, isDismissable } = p
  const say = useSay()
  const trigger = node.slots.trigger
  if (!trigger) {
    node.refuse('no trigger')
    return null
  }
  // The copy's left and right sit at the inline start and end (justify-start, justify-end).
  const edge = placement === 'start' ? 'left' : placement === 'end' ? 'right' : placement
  return (
    <Drawer
      onOpenChange={
        node.on.onOpenChange ? (open: boolean) => void node.fire('onOpenChange', open) : undefined
      }
    >
      {trigger}
      <Drawer.Backdrop variant={backdrop} isDismissable={isDismissable}>
        <Drawer.Content placement={edge}>
          <Drawer.Dialog>
            {({ close }: { close: () => void }) => (
              <OverlayScope node={node} close={close}>
                {edge === 'bottom' ? <Drawer.Handle /> : null}
                <Drawer.CloseTrigger aria-label={say('close')} />
                <Drawer.Header>
                  <Drawer.Heading>{title}</Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>
                  <div style={column}>{node.children}</div>
                </Drawer.Body>
                {node.slots.footer ? <Drawer.Footer>{node.slots.footer}</Drawer.Footer> : null}
              </OverlayScope>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}

export const structureBlocks: Record<string, Block> = {
  Tabs: TabsBlock,
  Tab: Nothing,
  Accordion: AccordionBlock,
  AccordionItem: Nothing,
  Separator: SeparatorBlock,
  Fieldset: FieldsetBlock,
  Drawer: DrawerBlock,
}
