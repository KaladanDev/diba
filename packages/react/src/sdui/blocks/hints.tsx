import { useLocale } from 'react-aria-components'
import { Badge } from '../../components/badge'
import { Label } from '../../components/label'
import { Meter } from '../../components/meter'
import { ProgressCircle } from '../../components/progress-circle'
import { Tooltip } from '../../components/tooltip'
import { formatNumber, numberFormatOptions } from '../format'
import type { Block } from '../node'
import { propsOf } from './common'

/**
 * The extra components' status and hints: a Tooltip, a Badge, a ProgressCircle and a Meter,
 * drawing the copied components.
 */

/** What can be focused on its own, so a tooltip needs no wrapper to be reached. */
const FOCUSABLE = new Set(['Button', 'LinkButton', 'Link', 'ToggleButton'])

/** A few words about the block it holds, under the pointer or the keyboard's focus. */
const TooltipBlock: Block = ({ node }) => {
  const p = propsOf(node)
  // Read up front: the words are drawn only while it shows.
  const { content, placement, delay, showArrow, isDisabled } = p
  const child = node.items[0]
  if (!child) {
    node.refuse('nothing to describe')
    return null
  }
  return (
    <Tooltip delay={delay} isDisabled={isDisabled}>
      {FOCUSABLE.has(child.type) ? (
        child.element
      ) : (
        // Text or a picture cannot take focus; the trigger lets a keyboard reach the words too.
        <Tooltip.Trigger aria-label={content}>{child.element}</Tooltip.Trigger>
      )}
      <Tooltip.Content placement={placement} showArrow={showArrow}>
        {showArrow ? <Tooltip.Arrow /> : null}
        {content}
      </Tooltip.Content>
    </Tooltip>
  )
}

/**
 * A count or a dot on its block's corner. A number is drawn in the page's digits, past `max` as
 * «۹۹+»; the copy's corners are the page's left and right, so start and end are turned onto them.
 */
const BadgeBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale, direction } = useLocale()
  const [edge = 'top', along = 'end'] = String(p.placement).split('-')
  const right = (along === 'end') !== (direction === 'rtl')
  const content = p.content
  const max = p.max as number
  const text =
    typeof content === 'number'
      ? content > max
        ? `${formatNumber(max, locale)}+`
        : formatNumber(content, locale)
      : content
  return (
    <Badge.Anchor>
      {node.children}
      <Badge
        color={p.color}
        variant={p.variant}
        size={p.size}
        placement={`${edge === 'bottom' ? 'bottom' : 'top'}-${right ? 'right' : 'left'}` as const}
        // A label is read only on an element with a role: a span's own is ignored. As an image,
        // a count or a dot says its label, «۳ پیام تازه», and not a bare «۳».
        role={p.label ? 'img' : undefined}
        aria-label={p.label}
      >
        {text ?? null}
      </Badge>
    </Badge.Anchor>
  )
}

const ProgressCircleBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <ProgressCircle
      value={p.value}
      minValue={p.minValue}
      maxValue={p.maxValue}
      isIndeterminate={p.isIndeterminate}
      color={p.color}
      size={p.size}
      aria-label={p.label}
    >
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  )
}

/** As the progress bar's block, without the waiting. */
const MeterBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const value = p.value as number | undefined
  // A toman cannot be an Intl currency, so its words are composed here.
  const toman = p.formatStyle === 'currency' && (p.currency === 'IRT' || p.currency === 'TOMAN')
  const valueLabel =
    p.valueLabel ??
    (toman && value !== undefined
      ? formatNumber(value, locale, { style: 'currency', currency: p.currency })
      : undefined)
  return (
    <Meter
      value={value}
      minValue={p.minValue}
      maxValue={p.maxValue}
      valueLabel={valueLabel}
      formatOptions={numberFormatOptions({ style: p.formatStyle, currency: p.currency })}
      color={p.color}
      size={p.size}
      aria-label={p.label ? undefined : valueLabel}
    >
      {p.label ? <Label>{p.label}</Label> : null}
      {p.showValue ? <Meter.Output /> : null}
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  )
}

export const hintBlocks: Record<string, Block> = {
  Tooltip: TooltipBlock,
  Badge: BadgeBlock,
  ProgressCircle: ProgressCircleBlock,
  Meter: MeterBlock,
}
