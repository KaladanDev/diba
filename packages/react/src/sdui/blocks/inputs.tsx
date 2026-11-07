import { Fragment, useMemo } from 'react'
import { useLocale } from 'react-aria-components'
import { ButtonGroup } from '../../components/button-group'
import { ColorSwatchPicker } from '../../components/color-swatch-picker'
import { Description } from '../../components/description'
import { InputOTP } from '../../components/input-otp'
import { Label } from '../../components/label'
import { Pagination } from '../../components/pagination'
import { toLatinDigits } from '../../utils/digits'
import { pageItems } from '../../utils/page-items'
import { formatNumber } from '../format'
import type { Block } from '../node'
import { ButtonGroupBlockContext, ErrorText, errorOf, propsOf, useSay } from './common'

/**
 * The extra components' inputs: a one-time code, a group of joined buttons, pagination and
 * colour swatches, drawing the copied components.
 */

/** The digits a code holds, Latin, however they were typed. */
const digitsOf = (value: unknown, length: number) =>
  toLatinDigits(String(value ?? ''))
    .replace(/\D/g, '')
    .slice(0, length)

/** A code, a box a digit; six are drawn as two threes, as the original's own example draws them. */
const InputOTPBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const length = Math.max(1, Math.min(12, Math.round(Number(p.length) || 6)))
  // Latin; the component draws it in the page's digits, as Flutter's slots are.
  const value = digitsOf(node.current, length)
  const error = errorOf(node)
  const indexes = Array.from({ length }, (_, i) => i)
  const groups = length === 6 ? [indexes.slice(0, 3), indexes.slice(3)] : [indexes]
  return (
    <div data-slot="input-otp-field" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
      <InputOTP
        maxLength={length}
        value={value}
        // Persian and Arabic-Indic digits are let in: the component hands them on as Latin.
        pattern="^[0-9]*$"
        inputMode="numeric"
        onChange={(typed: string) => {
          const code = digitsOf(typed, length)
          void node.setValue('onChange', code)
          if (code.length === length) void node.fire('onComplete', code)
        }}
        isDisabled={p.isDisabled}
        isInvalid={Boolean(error)}
        required={p.isRequired}
        name={p.name}
        variant={p.variant}
        aria-label={p.label}
      >
        {groups.map((group, i) => (
          <Fragment key={group[0]}>
            {i > 0 ? <InputOTP.Separator /> : null}
            <InputOTP.Group>
              {group.map((index) => (
                <InputOTP.Slot key={index} index={index} />
              ))}
            </InputOTP.Group>
          </Fragment>
        ))}
      </InputOTP>
      {p.description ? <Description>{p.description}</Description> : null}
      <ErrorText>{error}</ErrorText>
    </div>
  )
}

/** Buttons joined into one; what a button does not set itself is the group's. */
const ButtonGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const group = useMemo(
    () => ({ size: p.size, variant: p.variant, isDisabled: p.isDisabled, fullWidth: p.fullWidth }),
    [p.size, p.variant, p.isDisabled, p.fullWidth],
  )
  return (
    <ButtonGroupBlockContext value={group}>
      <ButtonGroup
        orientation={p.orientation}
        fullWidth={p.fullWidth}
        size={p.size}
        variant={p.variant}
        isDisabled={p.isDisabled}
      >
        {node.children}
      </ButtonGroup>
    </ButtonGroupBlockContext>
  )
}

/**
 * Previous, the pages near this one and at the ends with gaps between, next. The pages are in the
 * page's digits; the gaps are `pageItems`', which keeps the row's width as the reader moves.
 */
const PaginationBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const say = useSay()
  const total = Math.max(0, Math.round(Number(p.total) || 0))
  const page = Math.min(Math.max(Math.round(Number(node.current) || 1), 1), Math.max(total, 1))
  const go = (to: number) => {
    if (p.isDisabled || to === page || to < 1 || to > total) return
    void node.setValue('onChange', to)
  }
  const items = pageItems({ page, total, siblings: p.siblings, boundaries: p.boundaries })
  return (
    <Pagination size={p.size} aria-label={p.label}>
      <Pagination.Content>
        {p.showControls ? (
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={p.isDisabled || page <= 1}
              onPress={() => go(page - 1)}
            >
              <Pagination.PreviousIcon />
              <span>{say('previous')}</span>
            </Pagination.Previous>
          </Pagination.Item>
        ) : null}
        {items.map((item, i) =>
          item === 'ellipsis' ? (
            <Pagination.Item key={`gap-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Link
                isActive={item === page}
                isDisabled={p.isDisabled}
                onPress={() => go(item)}
              >
                {formatNumber(item, locale)}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        {p.showControls ? (
          <Pagination.Item>
            <Pagination.Next
              isDisabled={p.isDisabled || page >= total}
              onPress={() => go(page + 1)}
            >
              <span>{say('next')}</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        ) : null}
      </Pagination.Content>
    </Pagination>
  )
}

/** A colour from the swatches the app sends, as #rrggbb. */
const ColorSwatchPickerBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const colors = (Array.isArray(p.colors) ? p.colors : []).filter(
    (c: unknown): c is string => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c),
  )
  const current = typeof node.current === 'string' ? node.current : undefined
  return (
    <ColorSwatchPicker
      aria-label={p.label}
      value={current}
      onChange={(color: { toString: (format: 'hex') => string }) =>
        void node.setValue('onChange', color.toString('hex').toLowerCase())
      }
      variant={p.variant}
      size={p.size}
      layout={p.layout}
    >
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  )
}

export const inputBlocks: Record<string, Block> = {
  InputOTP: InputOTPBlock,
  ButtonGroup: ButtonGroupBlock,
  Pagination: PaginationBlock,
  ColorSwatchPicker: ColorSwatchPickerBlock,
}
