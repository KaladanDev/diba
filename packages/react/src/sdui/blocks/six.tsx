import { createContext, useContext, useState, type ComponentProps } from 'react'
import { useLocale } from 'react-aria-components'
import { Breadcrumbs } from '../../components/breadcrumbs'
import { Sheet } from '../../components/sheet'
import { SwitchGroup } from '../../components/switch-group'
import { Toolbar } from '../../components/toolbar'
import type { Block } from '../node'
import { Nothing, propsOf, useSay } from './common'
import { OverlayScope } from './containers'

/**
 * The last six copied components, given blocks so Flutter draws them too: Breadcrumbs, SwitchGroup, Toolbar and
 * Sheet here, Menu beside the Dropdown it shares its items with (pickers.tsx). ErrorMessage has
 * none of its own: a TagGroup's errorMessage is drawn with it.
 */

/**
 * The way to a page: each step a link, the last the page itself, current and going nowhere. In
 * a nav named «مسیر صفحه», the landmark a screen reader lists: a tree has no block to give one.
 */
const BreadcrumbsBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const steps = node.items.filter((item) => item.type === 'BreadcrumbsItem')
  return (
    <nav aria-label={say('breadcrumb')}>
      <Breadcrumbs isDisabled={p.isDisabled}>
        {steps.map((step) => (
          <Breadcrumbs.Item key={step.path} href={step.props.href as string | undefined}>
            {step.text}
          </Breadcrumbs.Item>
        ))}
      </Breadcrumbs>
    </nav>
  )
}

/** Switches 24 apart down, 16 across; each block sends its own value. */
const SwitchGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return <SwitchGroup orientation={p.orientation}>{node.children}</SwitchGroup>
}

/**
 * The toolbar a Separator block is in, if any: there it runs across the toolbar, as the original's
 * toolbar turns its separators, whatever the tree says (it says horizontal by default).
 */
export const ToolbarBlockContext = createContext<'horizontal' | 'vertical' | null>(null)
export const useToolbarSeparator = () => {
  const toolbar = useContext(ToolbarBlockContext)
  return toolbar === null ? null : toolbar === 'horizontal' ? 'vertical' : 'horizontal'
}

/** A row of controls the arrow keys move along, one stop for the Tab key. */
const ToolbarBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <ToolbarBlockContext.Provider value={p.orientation}>
      <Toolbar aria-label={p.label} orientation={p.orientation} isAttached={p.isAttached}>
        {node.children}
      </Toolbar>
    </ToolbarBlockContext.Provider>
  )
}

/**
 * A sheet opened by its trigger, as a Drawer is, drawn by the drawer's numbers: its
 * title, its blocks 16 apart, its footer. Start and end are the page's, so start is the right edge
 * in Persian; React Aria's sheet takes physical edges.
 */
const SheetBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const { direction } = useLocale()
  const [isOpen, setOpen] = useState(false)
  const trigger = node.slots.trigger
  if (!trigger) {
    node.refuse('no trigger')
    return null
  }
  const start = direction === 'rtl' ? 'right' : 'left'
  const end = direction === 'rtl' ? 'left' : 'right'
  const edge = p.placement === 'start' ? start : p.placement === 'end' ? end : p.placement
  const handled = edge === 'bottom' || edge === 'top'
  const handle = handled ? <Sheet.Handle /> : null
  return (
    <Sheet
      isOpen={isOpen}
      onOpenChange={(open) => {
        setOpen(open)
        if (node.on.onOpenChange) void node.fire('onOpenChange', open)
      }}
      placement={edge}
      snapPoints={p.snapPoints}
      isDetached={p.isDetached}
      isDismissable={p.isDismissable}
    >
      <Sheet.Trigger>{trigger as ComponentProps<typeof Sheet.Trigger>['children']}</Sheet.Trigger>
      <Sheet.Backdrop variant={p.backdrop}>
        <Sheet.Content>
          <Sheet.Dialog>
            <OverlayScope node={node} close={() => setOpen(false)}>
              {edge === 'bottom' ? handle : null}
              <Sheet.CloseTrigger aria-label={say('close')} />
              <Sheet.Header>
                <Sheet.Heading>{p.title}</Sheet.Heading>
              </Sheet.Header>
              <Sheet.Body>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {node.children}
                </div>
              </Sheet.Body>
              {node.slots.footer ? <Sheet.Footer>{node.slots.footer}</Sheet.Footer> : null}
              {edge === 'top' ? handle : null}
            </OverlayScope>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  )
}

export const sixBlocks: Record<string, Block> = {
  Breadcrumbs: BreadcrumbsBlock,
  BreadcrumbsItem: Nothing,
  SwitchGroup: SwitchGroupBlock,
  Toolbar: ToolbarBlock,
  Sheet: SheetBlock,
}
