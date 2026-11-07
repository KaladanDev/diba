import { useId, useState } from 'react'
import { useLocale } from 'react-aria-components'
import { Alert } from '../../components/alert'
import { Avatar } from '../../components/avatar'
import { AvatarGroup } from '../../components/avatar-group'
import { Chip } from '../../components/chip'
import { CloseButton } from '../../components/close-button'
import { Description } from '../../components/description'
import { Label } from '../../components/label'
import { ProgressBar } from '../../components/progress-bar'
import { Spinner } from '../../components/spinner'
import { Tag } from '../../components/tag'
import { TagGroup } from '../../components/tag-group'
import { formatNumber, numberFormatOptions } from '../format'
import type { Block, Item } from '../node'
import { isPersian, sayer } from '../messages'
import { ErrorText, Icon, Nothing, errorOf, hueOf, initials, propsOf, useSay } from './common'

/** Tinted in its status. A danger alert is announced unless told otherwise. */
const AlertBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const { icon, hideIcon, isLive, status } = p
  const [open, setOpen] = useState(true)
  if (!open) return null
  const live = (isLive as boolean | undefined) ?? status === 'danger'
  return (
    <Alert status={status} role={live ? 'alert' : undefined}>
      {hideIcon ? null : (
        <Alert.Indicator>{icon ? <Icon name={icon} size={20} /> : undefined}</Alert.Indicator>
      )}
      <Alert.Content>
        {p.title ? <Alert.Title>{p.title}</Alert.Title> : null}
        {p.description ? <Alert.Description>{p.description}</Alert.Description> : null}
        {node.slots.actions ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {node.slots.actions}
          </div>
        ) : null}
      </Alert.Content>
      {p.isDismissible ? (
        <CloseButton
          aria-label={say('close')}
          onPress={() => {
            setOpen(false)
            void node.fire('onClose')
          }}
        />
      ) : null}
    </Alert>
  )
}

/** A static label, such as an order status. A chip you press or remove is a Tag. */
const ChipBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <Chip variant={p.variant} color={p.color} size={p.size}>
      {p.icon ? <Icon name={p.icon} size={12} /> : null}
      <Chip.Label>{node.text}</Chip.Label>
    </Chip>
  )
}

/** Tags drawn as Flutter's chips; the remove buttons show when the group takes onRemove. */
const TagGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { emptyMessage } = p
  const removable = Boolean(node.on.onRemove)
  const error = errorOf(node)
  // The help and the error stay where TagGroup's look put them, under the group and outside
  // it, so they are tied to it by id: a screen reader had heard neither.
  const helpId = useId()
  const errorId = useId()
  const describedBy = [p.description ? helpId : null, error ? errorId : null].filter(Boolean)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <TagGroup
        aria-label={p.label}
        aria-describedby={describedBy.length ? describedBy.join(' ') : undefined}
        selectionMode={p.selectionMode}
        disallowEmptySelection={p.disallowEmptySelection}
        selectedKeys={(node.current as string[] | undefined) ?? []}
        onSelectionChange={(keys) =>
          void node.setValue('onSelectionChange', keys === 'all' ? [] : [...keys].map(String))
        }
        onRemove={
          removable
            ? (keys) => {
                for (const key of keys) void node.fire('onRemove', String(key))
              }
            : undefined
        }
        size={p.size}
        variant={p.variant}
      >
        {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
        <TagGroup.List
          renderEmptyState={() =>
            emptyMessage ? <span className="tag-group__empty">{emptyMessage}</span> : null
          }
        >
          {node.items
            .filter((item) => item.type === 'Tag')
            .map((item) => {
              const q = item.props as Record<string, any>
              return (
                <Tag
                  key={item.path}
                  id={q.id}
                  textValue={item.text ?? String(q.id)}
                  isDisabled={q.isDisabled}
                  href={q.href}
                  // A tag that opens a page is tinted and washed as a chosen one is.
                  data-link={q.href ? true : undefined}
                >
                  {q.icon ? <Icon name={q.icon} size={16} /> : null}
                  {item.text}
                  {removable ? <Tag.RemoveButton /> : null}
                </Tag>
              )
            })}
        </TagGroup.List>
      </TagGroup>
      {p.description ? <Description id={helpId}>{p.description}</Description> : null}
      <ErrorText id={errorId}>{error}</ErrorText>
    </div>
  )
}

const SpinnerBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  return <Spinner size={p.size} color={p.color} aria-label={p.label ?? say('loading')} />
}

/** Display only: one value and no pair. */
const ProgressBarBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const min = p.minValue as number
  const max = p.maxValue as number
  const value = p.value as number | undefined
  // A toman cannot be an Intl currency, so its words are composed here.
  const toman = p.formatStyle === 'currency' && (p.currency === 'IRT' || p.currency === 'TOMAN')
  const valueLabel =
    p.valueLabel ??
    (toman && value !== undefined
      ? formatNumber(value, locale, { style: 'currency', currency: p.currency })
      : undefined)
  return (
    <ProgressBar
      value={value}
      minValue={min}
      maxValue={max}
      isIndeterminate={p.isIndeterminate}
      valueLabel={valueLabel}
      formatOptions={numberFormatOptions({ style: p.formatStyle, currency: p.currency })}
      color={p.color}
      size={p.size}
      aria-label={p.label ? undefined : valueLabel}
    >
      {p.label ? <Label>{p.label}</Label> : null}
      {p.showValue ? <ProgressBar.Output /> : null}
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  )
}

/**
 * A photo over the initials, which stay if it fails, or an icon. An Avatar
 * element itself rather than a component around one, so an AvatarGroup can
 * count and size its children.
 *
 * Without a colour of its own or its group's, a named avatar takes its
 * name's hue (`data-hue`), drawn by Diba's theme; a presence dot and a gilt
 * ring, except in a stack, which would hide them.
 */
function avatar(
  q: Record<string, any>,
  locale: string,
  {
    key,
    group,
    stacked = false,
  }: { key?: string; group?: Record<string, any>; stacked?: boolean } = {},
) {
  const name = typeof q.name === 'string' ? q.name.trim() : ''
  const color = q.color ?? group?.color
  const presence = stacked ? undefined : (q.presence as Presence | undefined)
  // The name, then the presence: «نیلوفر رستمی، آنلاین».
  const label = [name, presence ? sayer(locale)(presence) : '']
    .filter(Boolean)
    .join(isPersian(locale) ? '، ' : ', ')
  return (
    <Avatar
      key={key}
      size={q.size ?? group?.size}
      color={color}
      variant={q.variant ?? group?.variant}
      data-hue={color === undefined && name ? hueOf(name) : undefined}
      data-ringed={!stacked && q.isRinged ? true : undefined}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      {q.src ? <Avatar.Image src={q.src} alt="" /> : null}
      <Avatar.Fallback aria-hidden>
        {q.icon ? <Icon name={q.icon} /> : initials(name)}
      </Avatar.Fallback>
      {presence ? <span className="avatar__presence" data-presence={presence} /> : null}
    </Avatar>
  )
}

type Presence = 'online' | 'away' | 'busy' | 'offline'

const AvatarBlock: Block = ({ node }) => avatar(propsOf(node), useLocale().locale)

/** What an avatar set itself, so the group's look fills in only what it left out. */
const ownOnly = (item: Item) =>
  Object.fromEntries(
    Object.entries(item.props).filter(
      ([name]) => item.given.has(name) || !['size', 'color', 'variant'].includes(name),
    ),
  )

const AvatarGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const say = useSay()
  const { locale } = useLocale()
  const group = { size: p.size, color: p.color, variant: p.variant }
  const avatars = node.items.filter((item) => item.type === 'Avatar')
  const rest = typeof p.max === 'number' ? Math.max(0, avatars.length - p.max) : 0
  return (
    <AvatarGroup
      max={p.max}
      size={p.size}
      color={p.color}
      variant={p.variant}
      overlap={p.overlap}
      isGrid={p.isGrid}
    >
      {avatars.map((item) =>
        avatar(ownOnly(item), locale, { key: item.path, group, stacked: !p.isGrid }),
      )}
      {rest > 0 ? (
        // "+3 more", in the reader's digits.
        <AvatarGroup.Count>{say('more', formatNumber(rest, locale))}</AvatarGroup.Count>
      ) : null}
    </AvatarGroup>
  )
}

export const statusBlocks: Record<string, Block> = {
  Alert: AlertBlock,
  Chip: ChipBlock,
  TagGroup: TagGroupBlock,
  Tag: Nothing,
  Spinner: SpinnerBlock,
  ProgressBar: ProgressBarBlock,
  Avatar: AvatarBlock,
  AvatarGroup: AvatarGroupBlock,
}
