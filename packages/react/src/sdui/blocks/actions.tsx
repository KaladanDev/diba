import { use, type ReactElement } from 'react'
import { Link as LinkPrimitive, OverlayArrow, TooltipTrigger } from 'react-aria-components'
import { Button } from '../../components/button'
import { Label } from '../../components/label'
import { Link } from '../../components/link'
import { Spinner } from '../../components/spinner'
import { ToggleButton } from '../../components/toggle-button'
import { ToggleButtonGroup } from '../../components/toggle-button-group'
import { Tooltip } from '../../components/_internal/portals'
import { buttonVariants } from '../../styles/recipes'
import type { Block, NodeContext } from '../node'
import { ButtonGroupBlockContext, Icon, Nothing, propsOf } from './common'

/** What a Button and a LinkButton put inside themselves: icon, text, icon. */
function ButtonContent({ node, pending }: { node: NodeContext; pending?: boolean }) {
  // Read up front, as every block reads its props: contract.test.ts holds each
  // block to reading every prop its manifest entry declares.
  const { icon: name, iconPlacement, isIconOnly } = propsOf(node)
  // A pending button keeps its label, and a spinner takes the icon's place, so
  // its width never jumps.
  const icon = pending ? <Spinner size="sm" color="current" /> : name ? <Icon name={name} /> : null
  if (isIconOnly) return icon
  return (
    <>
      {iconPlacement === 'end' ? null : icon}
      {node.text}
      {iconPlacement === 'end' ? icon : null}
    </>
  )
}

/**
 * A button that shows only its icon says its label in a tooltip, under a hover or keyboard focus,
 * as Flutter's renderer always has. The label was its
 * name for a screen reader only, so a mouse had nothing to read. The original's tooltip, above the
 * button with its arrow, 10 away; React Aria opens it after half a second, at once for the next
 * one, and never for a touch. Flutter's draws the same (actions.dart).
 */
function Hint({ label, children }: { label?: string; children: ReactElement }) {
  if (!label) return children
  return (
    <TooltipTrigger delay={500}>
      {children}
      <Tooltip className="tooltip" placement="top" offset={10} data-slot="tooltip">
        <OverlayArrow data-slot="overlay-arrow-group">
          <svg data-slot="overlay-arrow" fill="none" height="12" viewBox="0 0 12 12" width="12">
            <path d="M0 0C5.48483 8 6.5 8 12 0Z" />
          </svg>
        </OverlayArrow>
        {label}
      </Tooltip>
    </TooltipTrigger>
  )
}

const ButtonBlock: Block = ({ node }) => {
  const p = propsOf(node)
  // In a ButtonGroup, what the button does not set itself is the group's.
  const group = use(ButtonGroupBlockContext)
  const own = (name: 'size' | 'variant' | 'isDisabled' | 'fullWidth') =>
    group && !node.given.has(name) ? (group[name] as any) : p[name]
  const button = (
    <Button
      variant={own('variant')}
      size={own('size')}
      isIconOnly={p.isIconOnly}
      isDisabled={own('isDisabled')}
      isPending={p.isPending}
      fullWidth={own('fullWidth')}
      // submit and reset reach the Form block's own handlers through the page's
      // form, as any submit button's would.
      type={p.type}
      aria-label={p.label}
      onPress={node.on.onPress ? () => void node.fire('onPress') : undefined}
    >
      <ButtonContent node={node} pending={p.isPending} />
    </Button>
  )
  return p.isIconOnly ? <Hint label={p.label}>{button}</Hint> : button
}

/**
 * A link drawn as a button. A real link, so the host's router — React Aria's
 * RouterProvider — takes it, and a merchant can open it in a new tab.
 */
const LinkButtonBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const link = (
    <LinkPrimitive
      href={p.href}
      target={p.isExternal ? '_blank' : undefined}
      rel={p.isExternal ? 'noopener noreferrer' : undefined}
      isDisabled={p.isDisabled}
      aria-label={p.label}
      className={buttonVariants({
        variant: p.variant,
        size: p.size,
        isIconOnly: p.isIconOnly,
        fullWidth: p.fullWidth,
      })}
      onPress={node.on.onPress ? () => void node.fire('onPress') : undefined}
    >
      <ButtonContent node={node} />
    </LinkPrimitive>
  )
  return p.isIconOnly ? <Hint label={p.label}>{link}</Hint> : link
}

const LinkBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <Link
      href={p.href}
      target={p.isExternal ? '_blank' : undefined}
      rel={p.isExternal ? 'noopener noreferrer' : undefined}
      isDisabled={p.isDisabled}
    >
      {node.text}
    </Link>
  )
}

/** Attached segments or detached toggles; a selected one is gilt. */
const ToggleButtonGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const selected = (node.current as string[] | undefined) ?? []
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
      <ToggleButtonGroup
        aria-label={p.label}
        selectionMode={p.selectionMode}
        disallowEmptySelection={p.disallowEmptySelection}
        isDetached={p.isDetached}
        size={p.size}
        orientation={p.orientation}
        fullWidth={p.fullWidth}
        isDisabled={p.isDisabled}
        selectedKeys={selected}
        onSelectionChange={(keys) => void node.setValue('onSelectionChange', [...keys].map(String))}
      >
        {node.items
          .filter((item) => item.type === 'ToggleButton')
          .map((item) => {
            const q = item.props as Record<string, any>
            const toggle = (
              <ToggleButton
                key={item.path}
                id={q.id}
                isDisabled={q.isDisabled}
                isIconOnly={q.isIconOnly}
                aria-label={q.label}
              >
                {q.icon ? <Icon name={q.icon} /> : null}
                {q.isIconOnly ? null : item.text}
              </ToggleButton>
            )
            return q.isIconOnly ? (
              <Hint key={item.path} label={q.label}>
                {toggle}
              </Hint>
            ) : (
              toggle
            )
          })}
      </ToggleButtonGroup>
    </div>
  )
}

export const actionBlocks: Record<string, Block> = {
  Button: ButtonBlock,
  LinkButton: LinkButtonBlock,
  Link: LinkBlock,
  ToggleButtonGroup: ToggleButtonGroupBlock,
  ToggleButton: Nothing,
}
