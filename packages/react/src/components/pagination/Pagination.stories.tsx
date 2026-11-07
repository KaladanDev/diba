import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DibaSurface } from '../../sdui'
import { Device, Directions, Example, Grid, Stage, Themes, useT, Value } from '../../stories/kit'
import { pageItems } from '../../utils/page-items'
import { Card } from '../card'
import { Pagination } from './index'

// Pagination, every option it has and the lists it pages. The docs page is Pagination.mdx. A line
// comment, not a doc comment: the docs plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Pagination>

export default meta

type Size = 'sm' | 'md' | 'lg'

/** A number in the story's digits. */
function useNum() {
  const t = useT()
  const locale = t('fa-IR', 'en-US')
  return (v: number) => v.toLocaleString(locale)
}

/**
 * A pager over [total] pages: back, the pages near this one and at the ends with a gap for the
 * rest, and on. What every story here draws, with the options it is given.
 */
function Pager({
  total,
  initial = 1,
  size,
  siblings = 1,
  controls = true,
  words = true,
  isDisabled = false,
  summary,
  onPage,
  centred = false,
}: {
  total: number
  initial?: number
  size?: Size
  siblings?: number
  controls?: boolean
  words?: boolean
  isDisabled?: boolean
  summary?: (page: number) => string
  onPage?: (page: number) => void
  centred?: boolean
}) {
  const t = useT()
  const num = useNum()
  const [page, setPage] = useState(initial)
  const go = (to: number) => {
    setPage(to)
    onPage?.(to)
  }
  return (
    <Pagination
      size={size}
      aria-label={t('صفحه‌ها', 'Pages')}
      style={centred ? { justifyContent: 'center' } : undefined}
    >
      {summary ? <Pagination.Summary>{summary(page)}</Pagination.Summary> : null}
      <Pagination.Content>
        {controls ? (
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={isDisabled || page === 1}
              aria-label={words ? undefined : t('صفحهٔ قبل', 'Previous page')}
              onPress={() => go(page - 1)}
            >
              <Pagination.PreviousIcon />
              {words ? t('قبلی', 'Previous') : null}
            </Pagination.Previous>
          </Pagination.Item>
        ) : null}
        {pageItems({ page, total, siblings }).map((item, i) =>
          item === 'ellipsis' ? (
            <Pagination.Item key={`gap-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={item}>
              <Pagination.Link
                isActive={item === page}
                isDisabled={isDisabled}
                onPress={() => go(item)}
              >
                {num(item)}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        {controls ? (
          <Pagination.Item>
            <Pagination.Next
              isDisabled={isDisabled || page === total}
              aria-label={words ? undefined : t('صفحهٔ بعد', 'Next page')}
              onPress={() => go(page + 1)}
            >
              {words ? t('بعدی', 'Next') : null}
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        ) : null}
      </Pagination.Content>
    </Pagination>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  size: Size
  total: number
  siblings: number
  controls: boolean
  isDisabled: boolean
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { size: 'md', total: 12, siblings: 1, controls: true, isDisabled: false },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Pages 28, 32 or 36 round from 768 wide; on a phone 32, 36 or 40.',
      table: { category: 'Pagination', defaultValue: { summary: 'md' } },
    },
    total: {
      control: { type: 'number', min: 1, max: 99 },
      description: 'pageItems: how many pages there are.',
      table: { category: 'pageItems' },
    },
    siblings: {
      control: { type: 'number', min: 0, max: 3 },
      description: 'pageItems: pages shown either side of the current one.',
      table: { category: 'pageItems', defaultValue: { summary: '1' } },
    },
    controls: {
      description: 'Pagination.Previous and Pagination.Next at its ends.',
      table: { category: 'Example' },
    },
    isDisabled: {
      description: 'On each link: none can be pressed.',
      table: { category: 'Example' },
    },
  },
  render: (args) => (
    <Stage width={720}>
      <Pager key={`${args.total}-${args.siblings}`} {...args} />
    </Stage>
  ),
}

// ---- its options ---------------------------------------------------------------------------------

/** Its sizes: pages 28, 32 and 36 round, a step larger on a phone. */
export const Sizes: StoryObj = {
  render: () => (
    <Grid min={420}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Example key={size} title={size}>
          <Pager total={5} initial={2} size={size} />
        </Example>
      ))}
    </Grid>
  ),
}

/** Many pages: the ends and the pages near this one, a gap for the rest, the row one width. */
export const ManyPages: StoryObj = {
  name: 'Many pages',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={520}>
        <Example title={t('نزدیک آغاز', 'Near the start')}>
          <Pager total={24} initial={2} />
        </Example>
        <Example title={t('در میانه', 'In the middle')}>
          <Pager total={24} initial={12} />
        </Example>
        <Example title={t('دو صفحه در هر سو', 'Two pages either side')} note="siblings: 2">
          <Pager total={24} initial={12} siblings={2} />
        </Example>
      </Grid>
    )
  },
}

/** Which rows these are, in Pagination.Summary at its start. */
export const WithSummary: StoryObj = {
  name: 'With a summary',
  render: function Render() {
    const t = useT()
    const num = useNum()
    const per = 20
    const count = 234
    return (
      <Stage width={760}>
        <Pager
          total={Math.ceil(count / per)}
          summary={(page) =>
            t(
              `${num((page - 1) * per + 1)} تا ${num(Math.min(page * per, count))} از ${num(count)} سفارش`,
              `${(page - 1) * per + 1} to ${Math.min(page * per, count)} of ${count} orders`,
            )
          }
        />
      </Stage>
    )
  },
}

/** Back and on as arrows alone, each named for a screen reader; or the pages alone. */
export const Compact: StoryObj = {
  name: 'Arrows alone, or pages alone',
  render: function Render() {
    const t = useT()
    return (
      <Grid min={360}>
        <Example title={t('پیکان‌ها بی واژه', 'Arrows without words')}>
          <Pager total={8} initial={3} words={false} />
        </Example>
        <Example title={t('فقط صفحه‌ها', 'Pages alone')}>
          <Pager total={8} initial={3} controls={false} />
        </Example>
      </Grid>
    )
  },
}

/** Off: while the rows load, none of it can be pressed. */
export const Disabled: StoryObj = {
  name: 'Off',
  render: () => (
    <Stage width={520}>
      <Pager total={8} initial={3} isDisabled />
    </Stage>
  ),
}

/** Told which page was chosen, to load its rows. */
export const Controlled: StoryObj = {
  name: 'Told the page',
  render: function Render() {
    const [page, setPage] = useState(1)
    return (
      <Stage width={520}>
        <Pager total={8} onPage={setPage} />
        <Value label="page" value={page} />
      </Stage>
    )
  },
}

// ---- what it pages -------------------------------------------------------------------------------

/** The admin's orders: the rows shown at the start, the pages at the end, under the list. */
export const OrdersFoot: StoryObj = {
  name: 'Example: under the orders',
  render: function Render() {
    const t = useT()
    const num = useNum()
    return (
      <Stage width={760}>
        <Card>
          <Card.Content>
            <span className="text-muted" style={{ fontSize: 14 }}>
              {t('… سفارش‌های این صفحه …', '… this page’s orders …')}
            </span>
          </Card.Content>
          <Card.Footer>
            <div style={{ width: '100%' }}>
              <Pager
                total={12}
                size="sm"
                summary={(page) =>
                  t(
                    `${num((page - 1) * 20 + 1)} تا ${num(page * 20)} از ${num(234)}`,
                    `${(page - 1) * 20 + 1} to ${page * 20} of 234`,
                  )
                }
              />
            </div>
          </Card.Footer>
        </Card>
      </Stage>
    )
  },
}

/** The storefront's search: the pages in the middle, under the products. */
export const SearchResults: StoryObj = {
  name: 'Example: a storefront’s search',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={760}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span className="text-muted" style={{ fontSize: 14 }}>
            {t('۴۸ کالا برای «شال»', '48 products for “scarf”')}
          </span>
          <Pager total={4} centred />
        </div>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

/** In both themes: the page shown on the neutral fill. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Pager total={12} initial={5} />
    </Themes>
  ),
}

/** On a Persian page and an English one: back at the start, its arrow pointing there. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Pager total={12} initial={5} />
    </Directions>
  ),
}

/** On a phone: the pages a step larger, for a finger, and a row too long for it wraps. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Pager total={12} initial={5} />
    </Device>
  ),
}

/** The same pager as a block: it works out which pages to show itself. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Pagination',
      props: { label: t('صفحه‌های سفارش', 'Order pages'), total: 24, defaultPage: 12 },
    }
    return (
      <Grid min={420}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          <DibaSurface tree={tree as never} />
        </Example>
        <Example title={t('درخت', 'The tree')}>
          <pre
            dir="ltr"
            className="text-foreground"
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: '18px',
              background: 'var(--default)',
              borderRadius: 16,
              padding: 16,
              overflow: 'auto',
            }}
          >
            {JSON.stringify(tree, null, 2)}
          </pre>
        </Example>
      </Grid>
    )
  },
}
