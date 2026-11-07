import { Checkbox } from '../../components/checkbox'
import { CheckboxGroup } from '../../components/checkbox-group'
import { Description } from '../../components/description'
import { FieldError } from '../../components/field-error'
import { Label } from '../../components/label'
import { Radio } from '../../components/radio'
import { RadioGroup } from '../../components/radio-group'
import { Slider } from '../../components/slider'
import { Switch } from '../../components/switch'
import { useLocale } from 'react-aria-components'
import { formatNumber, numberFormatOptions } from '../format'
import type { Block, Item } from '../node'
import { ErrorText, FieldParts, Nothing, errorOf, hiddenLabel, propsOf } from './common'

/** A group's options, side by side or one under another. */
const optionsStyle = (orientation: unknown) => ({
  display: 'flex',
  flexDirection: orientation === 'horizontal' ? ('row' as const) : ('column' as const),
  flexWrap: 'wrap' as const,
  gap: orientation === 'horizontal' ? 16 : 8,
})

/**
 * A checkbox's parts, drawn as Flutter's. Inside a CheckboxGroup the
 * group owns the value, so the box takes none of its own.
 */
function CheckboxView({
  props: q,
  error,
  own,
}: {
  props: Record<string, any>
  error?: string
  own?: { isSelected: boolean; onChange: (value: boolean) => void }
}) {
  return (
    <Checkbox
      {...own}
      value={q.value}
      name={q.name}
      isIndeterminate={q.isIndeterminate}
      isRequired={q.isRequired}
      isDisabled={q.isDisabled}
      isInvalid={Boolean(error)}
      validationBehavior="aria"
      variant={q.variant}
      aria-label={q.isLabelHidden ? q.label : undefined}
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        {q.label && !q.isLabelHidden ? <Label>{q.label}</Label> : null}
      </Checkbox.Content>
      {q.description ? <Description>{q.description}</Description> : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </Checkbox>
  )
}

/** Alone, a checkbox sends a boolean. */
const CheckboxBlock: Block = ({ node }) => (
  <CheckboxView
    props={propsOf(node)}
    error={errorOf(node)}
    own={{
      isSelected: node.current === true,
      onChange: (value) => void node.setValue('onChange', value),
    }}
  />
)

const CheckboxGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <CheckboxGroup
      value={(node.current as string[] | undefined) ?? []}
      onChange={(value: string[]) => void node.setValue('onChange', value)}
      isRequired={p.isRequired}
      isDisabled={p.isDisabled}
      isInvalid={Boolean(errorOf(node))}
      validationBehavior="aria"
      name={p.name}
      variant={p.variant}
      aria-label={hiddenLabel(node)}
    >
      <FieldParts node={node}>
        <div style={optionsStyle(p.orientation)}>
          {node.items
            .filter((item) => item.type === 'Checkbox')
            .map((item) => (
              <CheckboxView key={item.path} props={item.props} />
            ))}
        </div>
      </FieldParts>
    </CheckboxGroup>
  )
}

function RadioView({ item }: { item: Item }) {
  const q = item.props as Record<string, any>
  return (
    <Radio value={q.value} isDisabled={q.isDisabled}>
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Label>{q.label}</Label>
      </Radio.Content>
      {q.description ? <Description>{q.description}</Description> : null}
    </Radio>
  )
}

/** The star is on the group's label only. */
const RadioGroupBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <RadioGroup
      value={(node.current as string | null | undefined) ?? null}
      onChange={(value: string) => void node.setValue('onChange', value)}
      orientation={p.orientation}
      isRequired={p.isRequired}
      isDisabled={p.isDisabled}
      isInvalid={Boolean(errorOf(node))}
      validationBehavior="aria"
      name={p.name}
      variant={p.variant}
      aria-label={hiddenLabel(node)}
    >
      <FieldParts node={node}>
        <div style={optionsStyle(p.orientation)}>
          {node.items
            .filter((item) => item.type === 'Radio')
            .map((item) => (
              <RadioView key={item.path} item={item} />
            ))}
        </div>
      </FieldParts>
    </RadioGroup>
  )
}

/** Flutter's M3 switch on both platforms. Alone, it sends a boolean. */
const SwitchBlock: Block = ({ node }) => {
  const p = propsOf(node)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Switch
        isSelected={node.current === true}
        onChange={(value: boolean) => void node.setValue('onChange', value)}
        size={p.size}
        isDisabled={p.isDisabled}
        name={p.name}
        aria-label={hiddenLabel(node)}
      >
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
        </Switch.Content>
        {p.description ? <Description>{p.description}</Description> : null}
      </Switch>
      <ErrorText>{errorOf(node)}</ErrorText>
    </div>
  )
}

/** Flutter's M3 slider on both platforms. */
const SliderBlock: Block = ({ node }) => {
  const p = propsOf(node)
  const { locale } = useLocale()
  const min = (p.minValue as number) ?? 0
  const max = (p.maxValue as number) ?? 100
  const current = node.current as number | number[] | undefined
  const value = current ?? (p.isRange ? [min, max] : min)
  // percent is the fraction of the range; a toman is composed.
  const show = (v: number) =>
    formatNumber(p.formatStyle === 'percent' ? (v - min) / (max - min || 1) : v, locale, {
      style: p.formatStyle,
      currency: p.currency,
    })
  const wire = (v: number | number[]) => (Array.isArray(v) ? [v[0], v[1]] : v)
  return (
    <Slider
      value={value}
      onChange={(v: number | number[]) => void node.setValue('onChange', wire(v))}
      onChangeEnd={
        node.on.onChangeEnd
          ? (v: number | number[]) => void node.fire('onChangeEnd', wire(v))
          : undefined
      }
      minValue={min}
      maxValue={max}
      step={p.step}
      isDisabled={p.isDisabled}
      formatOptions={numberFormatOptions({ style: p.formatStyle, currency: p.currency })}
      aria-label={hiddenLabel(node)}
    >
      {p.label && !p.isLabelHidden ? <Label>{p.label}</Label> : null}
      {p.showValue ? (
        <Slider.Output>
          {({ state }: any) => state.values.map((v: number) => show(v)).join(' – ')}
        </Slider.Output>
      ) : null}
      <Slider.Track>
        {({ state }: any) => (
          <>
            <Slider.Fill />
            {state.values.map((_: number, i: number) => (
              <Slider.Thumb key={i} index={i} name={p.name} />
            ))}
          </>
        )}
      </Slider.Track>
      {p.description ? <Description>{p.description}</Description> : null}
      <ErrorText>{errorOf(node)}</ErrorText>
    </Slider>
  )
}

export const choiceBlocks: Record<string, Block> = {
  Checkbox: CheckboxBlock,
  CheckboxGroup: CheckboxGroupBlock,
  RadioGroup: RadioGroupBlock,
  Radio: Nothing,
  Switch: SwitchBlock,
  Slider: SliderBlock,
}
