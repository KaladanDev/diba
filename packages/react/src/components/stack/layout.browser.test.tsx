import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Bold, Info, Italic } from 'lucide-react'
import type { ReactNode } from 'react'
import { DibaProvider } from '../../provider/DibaProvider'
import { DibaSurface } from '../../sdui'
import { box, settled } from '../../test/visual'
import {
  Button,
  ButtonGroup,
  Description,
  Fieldset,
  Input,
  Label,
  Spacer,
  Stack,
  Tabs,
  Text,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '../../index'

/**
 * The structure as a page composes it, on the stylesheet apps load (the copy's): Diba's own Stack,
 * Spacer and Text drawn by their own rules as their blocks are; a fieldset's fields 24 under its
 * legend; a tab's icon 16 and 8 before its label; and an icon-only button square in a column.
 */

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <DibaProvider theme={theme} locale="fa-IR" dir="rtl">
      <div
        data-reduce-motion="true"
        style={{
          background: 'var(--surface)',
          color: 'var(--foreground)',
          padding: 16,
          width: 480,
        }}
      >
        {children}
      </div>
    </DibaProvider>
  )
}

const slot = (container: HTMLElement, name: string) => [
  ...container.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`),
]

describe('Diba’s own primitives', () => {
  it('a Stack lays out its gap, direction and alignment by its own rules', async () => {
    const { container } = render(
      <Page>
        <Stack direction="horizontal" gap={6} align="center" justify="between" wrap>
          <span>یک</span>
          <span>دو</span>
        </Stack>
      </Page>,
    )
    await settled(50)
    const s = getComputedStyle(slot(container, 'stack')[0]!)
    expect([
      s.display,
      s.flexDirection,
      s.columnGap,
      s.alignItems,
      s.justifyContent,
      s.flexWrap,
    ]).toEqual(['flex', 'row', '24px', 'center', 'space-between', 'wrap'])
  })

  it('a Spacer takes its room, down or across', async () => {
    const { container } = render(
      <Page>
        <Spacer size={8} />
        <div style={{ display: 'flex' }}>
          <Spacer size={6} axis="inline" />
        </div>
      </Page>,
    )
    await settled(50)
    const [down, across] = slot(container, 'spacer')
    expect(box(down!).height).toBe(32)
    expect(box(across!).width).toBe(24)
  })

  it('a Text draws the block’s scale and colours, light and dark', async () => {
    for (const theme of ['light', 'dark'] as const) {
      const { container, unmount } = render(
        <Page theme={theme}>
          <Text size="xs" tone="muted">
            یادداشت
          </Text>
          <Text size="lg" tone="accent">
            برجسته
          </Text>
          <Text tone="primary">برجسته</Text>
          <Text>متن</Text>
          <DibaSurface
            tree={{
              type: 'Stack',
              children: [
                { type: 'Text', props: { size: 'xs', tone: 'muted' }, children: 'یادداشت' },
                { type: 'Text', props: { size: 'lg', tone: 'accent' }, children: 'برجسته' },
              ],
            }}
          />
        </Page>,
      )
      await settled(50)
      const [muted, accent, primary, plain, blockMuted, blockAccent] = slot(container, 'text').map(
        (el) => getComputedStyle(el),
      )
      const page = getComputedStyle(container.querySelector<HTMLElement>('[data-reduce-motion]')!)
      expect([muted!.fontSize, muted!.lineHeight]).toEqual(['12px', '16px'])
      expect([accent!.fontSize, accent!.lineHeight]).toEqual(['18px', '28px'])
      expect(muted!.color).toBe(blockMuted!.color)
      expect(accent!.color).toBe(blockAccent!.color)
      expect(primary!.color).toBe(accent!.color)
      expect(muted!.color).not.toBe(plain!.color)
      expect(plain!.color).toBe(page.color)
      unmount()
    }
  })
})

describe('a fieldset', () => {
  it('sets its fields 24 under its legend, or right under its description', async () => {
    const { container } = render(
      <Page>
        <Fieldset>
          <Fieldset.Legend>قیمت</Fieldset.Legend>
          <Fieldset.Group>
            <TextField>
              <Label>قیمت</Label>
              <Input />
            </TextField>
          </Fieldset.Group>
        </Fieldset>
        <Fieldset>
          <Fieldset.Legend>نشانی</Fieldset.Legend>
          <Description>سفارش به همین نشانی فرستاده می‌شود.</Description>
          <Fieldset.Group>
            <TextField>
              <Label>شهر</Label>
              <Input />
            </TextField>
          </Fieldset.Group>
        </Fieldset>
      </Page>,
    )
    await settled(50)
    const [alone, described] = [...container.querySelectorAll<HTMLElement>('.fieldset')]
    const gap = (from: Element, to: Element) => box(to).top - box(from).bottom
    expect(
      gap(alone!.querySelector('legend')!, alone!.querySelector('.fieldset__field-group')!),
    ).toBe(24)
    const legend = described!.querySelector('legend')!
    const description = described!.querySelector('[data-slot="description"]')!
    expect(gap(legend, description)).toBe(0)
    expect(gap(description, described!.querySelector('.fieldset__field-group')!)).toBe(24)
  })
})

describe('a tab with an icon', () => {
  it('draws it 16 and 8 before its label', async () => {
    const { container } = render(
      <Page>
        <Tabs>
          <Tabs.ListContainer>
            <Tabs.List aria-label="بخش‌ها">
              <Tabs.Tab id="details">
                <Info />
                مشخصات
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="stock">
                موجودی
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="details">x</Tabs.Panel>
          <Tabs.Panel id="stock">y</Tabs.Panel>
        </Tabs>
      </Page>,
    )
    await settled(50)
    const tab = container.querySelector<HTMLElement>('.tabs__tab')!
    const icon = box(tab.querySelector('svg')!)
    const range = document.createRange()
    range.selectNodeContents(tab.childNodes[1]!)
    const words = range.getBoundingClientRect()
    expect([icon.width, icon.height]).toEqual([16, 16])
    // A Persian page: the icon at the start, the right, its words 8 to its left.
    expect(Math.round(icon.left - words.right)).toBe(8)
    expect(tab.offsetHeight).toBe(32)
  })
})

describe('an icon-only button in a column', () => {
  it('keeps its square, in a button group and a toggle group, beside a stretched one', async () => {
    const { container } = render(
      <Page>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <ButtonGroup orientation="vertical" aria-label="قالب">
            <Button isIconOnly aria-label="پررنگ">
              <Bold />
            </Button>
            <Button>پیوند بلند</Button>
          </ButtonGroup>
          <ToggleButtonGroup orientation="vertical" aria-label="سبک">
            <ToggleButton id="bold" isIconOnly aria-label="پررنگ">
              <Bold />
            </ToggleButton>
            <ToggleButton id="italic" isIconOnly aria-label="کج">
              <Italic />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Page>,
    )
    await settled(50)
    for (const button of container.querySelectorAll<HTMLElement>(
      '.button--icon-only, .toggle-button--icon-only',
    )) {
      expect(button.offsetWidth).toBe(button.offsetHeight)
    }
    const [square, wide] = [...container.querySelectorAll<HTMLElement>('.button-group .button')]
    expect(wide!.offsetWidth).toBeGreaterThan(square!.offsetWidth)
  })
})
