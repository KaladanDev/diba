import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dot, House, MoreHorizontal, Pencil, Slash } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { DibaSurface } from '../../sdui'
import {
  Device,
  Directions,
  Example,
  Grid,
  Page,
  Stage,
  Themes,
  useT,
  Value,
} from '../../stories/kit'
import { Button } from '../button'
import { Breadcrumbs } from './index'

// The Breadcrumbs, every option it has and what it is built into. The docs page is
// Breadcrumbs.mdx. A line comment, not a doc comment: the docs plugin replaces a commented meta's
// parameters with one.
const meta = {
  title: 'Components/Navigation/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Breadcrumbs>

export default meta

type T = ReturnType<typeof useT>

/** The steps down to an order, in the reader's language. */
const toAnOrder = (t: T) => [
  { href: '#home', name: t('پیشخوان', 'Home') },
  { href: '#orders', name: t('سفارش‌ها', 'Orders') },
  { name: t('سفارش ۱۰۴۱', 'Order 1041') },
]

/** The steps down to a product, six deep. */
const toAProduct = (t: T) => [
  { href: '#home', name: t('پیشخوان', 'Home') },
  { href: '#products', name: t('محصولات', 'Products') },
  { href: '#clothing', name: t('پوشاک', 'Clothing') },
  { href: '#scarves', name: t('شال و روسری', 'Scarves and shawls') },
  { href: '#silk', name: t('ابریشمی', 'Silk') },
  { name: t('شال ابریشم دست‌باف یزد', 'Hand-woven Yazd silk scarf') },
]

/**
 * A trail in its landmark: a nav named for what it is, so a screen reader can find it and say
 * what it holds. Breadcrumbs draw the list; the page gives the nav.
 */
function Trail({ children }: { children: ReactNode }) {
  const t = useT()
  return <nav aria-label={t('مسیر صفحه', 'Breadcrumb')}>{children}</nav>
}

/** A step with an icon before its name. */
function WithIcon({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {icon}
      {children}
    </span>
  )
}

// ---- the playground ------------------------------------------------------------------------------

type PlaygroundArgs = {
  steps: number
  separator: 'chevron' | 'slash' | 'dot'
  homeIcon: boolean
  isDisabled: boolean
  width: number
}

/** Every option on the controls. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: { steps: 4, separator: 'chevron', homeIcon: false, isDisabled: false, width: 640 },
  argTypes: {
    steps: {
      control: { type: 'range', min: 2, max: 6, step: 1 },
      description: 'How many steps, the last the page itself.',
      table: { category: 'Example' },
    },
    separator: {
      control: 'inline-radio',
      options: ['chevron', 'slash', 'dot'],
      description: 'Between the steps: the chevron by default, or any element.',
      table: { category: 'Breadcrumbs', defaultValue: { summary: 'chevron' } },
    },
    homeIcon: { description: 'An icon before the first step.', table: { category: 'Example' } },
    isDisabled: {
      description: 'No step can be followed.',
      table: { category: 'Breadcrumbs', defaultValue: { summary: 'false' } },
    },
    width: {
      control: { type: 'range', min: 240, max: 960, step: 20 },
      description: 'How wide the example is drawn.',
      table: { category: 'Example' },
    },
  },
  render: function Render({ steps, separator, homeIcon, isDisabled, width }) {
    const t = useT()
    const all = toAProduct(t)
    const shown = [...all.slice(0, steps - 1), all[all.length - 1]!]
    return (
      <Stage width={width}>
        <Trail>
          <Breadcrumbs
            isDisabled={isDisabled}
            separator={
              separator === 'slash' ? (
                <Slash aria-hidden />
              ) : separator === 'dot' ? (
                <Dot aria-hidden />
              ) : undefined
            }
          >
            {shown.map((step, i) => (
              <Breadcrumbs.Item key={step.name} href={step.href}>
                {homeIcon && i === 0 ? (
                  <WithIcon icon={<House aria-hidden size={14} />}>{step.name}</WithIcon>
                ) : (
                  step.name
                )}
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
        </Trail>
      </Stage>
    )
  },
}

// ---- its options ---------------------------------------------------------------------------------

/** Each step a link, the page itself last: current, in the link colour, and going nowhere. */
export const ATrail: StoryObj = {
  name: 'A trail',
  render: function Render() {
    const t = useT()
    return (
      <Trail>
        <Breadcrumbs>
          {toAnOrder(t).map((step) => (
            <Breadcrumbs.Item key={step.name} href={step.href}>
              {step.name}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </Trail>
    )
  },
}

/** The chevron by default, turned on a right-to-left page; or any element of yours. */
export const Separators: StoryObj = {
  render: function Render() {
    const t = useT()
    const separators: [string, ReactNode][] = [
      [t('پیش‌فرض: جناغ', 'The default: a chevron'), undefined],
      [t('خط مورب', 'A slash'), <Slash key="s" aria-hidden />],
      [t('نقطه', 'A dot'), <Dot key="d" aria-hidden />],
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {separators.map(([title, separator]) => (
          <Example key={title} title={title}>
            <Trail>
              <Breadcrumbs separator={separator}>
                {toAnOrder(t).map((step) => (
                  <Breadcrumbs.Item key={step.name} href={step.href}>
                    {step.name}
                  </Breadcrumbs.Item>
                ))}
              </Breadcrumbs>
            </Trail>
          </Example>
        ))}
      </div>
    )
  },
}

/** An icon before a step's name, or in place of it, named for a screen reader. */
export const Icons: StoryObj = {
  render: function Render() {
    const t = useT()
    const [, ...rest] = toAnOrder(t)
    return (
      <Grid min={300}>
        <Example title={t('آیکون و نام', 'An icon and a name')}>
          <Trail>
            <Breadcrumbs>
              <Breadcrumbs.Item href="#home">
                <WithIcon icon={<House aria-hidden size={14} />}>{t('پیشخوان', 'Home')}</WithIcon>
              </Breadcrumbs.Item>
              {rest.map((step) => (
                <Breadcrumbs.Item key={step.name} href={step.href}>
                  {step.name}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
          </Trail>
        </Example>
        <Example
          title={t('فقط آیکون', 'An icon alone')}
          note={t('نامش در aria-label', 'Its name in aria-label')}
        >
          <Trail>
            <Breadcrumbs>
              <Breadcrumbs.Item href="#home" aria-label={t('پیشخوان', 'Home')}>
                <House aria-hidden size={14} />
              </Breadcrumbs.Item>
              {rest.map((step) => (
                <Breadcrumbs.Item key={step.name} href={step.href}>
                  {step.name}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
          </Trail>
        </Example>
      </Grid>
    )
  },
}

/** Disabled, the trail stays to read, but no step goes anywhere. */
export const Disabled: StoryObj = {
  render: function Render() {
    const t = useT()
    return (
      <Trail>
        <Breadcrumbs isDisabled>
          {toAnOrder(t).map((step) => (
            <Breadcrumbs.Item key={step.name} href={step.href}>
              {step.name}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </Trail>
    )
  },
}

/** A long trail on a narrow page: the steps wrap onto the next line. */
export const LongTrail: StoryObj = {
  name: 'A long trail',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={360}>
        <Trail>
          <Breadcrumbs>
            {toAProduct(t).map((step) => (
              <Breadcrumbs.Item key={step.name} href={step.href}>
                {step.name}
              </Breadcrumbs.Item>
            ))}
          </Breadcrumbs>
        </Trail>
      </Stage>
    )
  },
}

const FOLDERS = {
  files: { fa: 'پرونده‌ها', en: 'Files', in: ['pictures', 'invoices'] },
  pictures: { fa: 'تصاویر', en: 'Pictures', in: ['products', 'banners'] },
  invoices: { fa: 'فاکتورها', en: 'Invoices', in: [] },
  products: { fa: 'محصولات', en: 'Products', in: ['scarves'] },
  banners: { fa: 'بنرها', en: 'Banners', in: [] },
  scarves: { fa: 'شال‌ها', en: 'Scarves', in: [] },
} as const
type Folder = keyof typeof FOLDERS

/** Steps without links: onAction is told which was pressed, and the page goes there itself. */
export const OnAction: StoryObj = {
  name: 'Going back with onAction',
  render: function Render() {
    const t = useT()
    const [path, setPath] = useState<Folder[]>(['files', 'pictures', 'products'])
    const here = path[path.length - 1]!
    const name = (folder: Folder) => t(FOLDERS[folder].fa, FOLDERS[folder].en)
    return (
      <Stage width={560} surface>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 8 }}>
          <Trail>
            <Breadcrumbs
              onAction={(key) => {
                const folder = String(key).replace('folder-', '') as Folder
                setPath(path.slice(0, path.indexOf(folder) + 1))
              }}
            >
              {path.map((folder) => (
                <Breadcrumbs.Item key={folder} id={`folder-${folder}`}>
                  {name(folder)}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
          </Trail>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FOLDERS[here].in.length ? (
              FOLDERS[here].in.map((folder) => (
                <Button
                  key={folder}
                  size="sm"
                  variant="secondary"
                  onPress={() => setPath([...path, folder])}
                >
                  {name(folder)}
                </Button>
              ))
            ) : (
              <span className="text-muted" style={{ fontSize: 13 }}>
                {t('پوشه‌ای در این پوشه نیست.', 'No folders in this one.')}
              </span>
            )}
          </div>
          <Value label={t('اینجا', 'Here')} value={here} />
        </div>
      </Stage>
    )
  },
}

// ---- what it builds ------------------------------------------------------------------------------

/** An order's page: the trail over its title, the title's actions at the end. */
export const OrderHeader: StoryObj = {
  name: 'Example: an order’s header',
  render: function Render() {
    const t = useT()
    return (
      <Page>
        <Stage width={960}>
          <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Trail>
              <Breadcrumbs>
                {toAnOrder(t).map((step) => (
                  <Breadcrumbs.Item key={step.name} href={step.href}>
                    {step.name}
                  </Breadcrumbs.Item>
                ))}
              </Breadcrumbs>
            </Trail>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <h1 className="text-foreground" style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                {t('سفارش ۱۰۴۱', 'Order 1041')}
              </h1>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm">
                  <Pencil aria-hidden size={16} />
                  {t('ویرایش', 'Edit')}
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  isIconOnly
                  aria-label={t('کارهای دیگر', 'More actions')}
                >
                  <MoreHorizontal aria-hidden size={16} />
                </Button>
              </div>
            </div>
          </header>
        </Stage>
      </Page>
    )
  },
}

/** A settings section, two steps down. */
export const SettingsHeader: StoryObj = {
  name: 'Example: a settings section',
  render: function Render() {
    const t = useT()
    return (
      <Stage width={720}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Trail>
            <Breadcrumbs>
              <Breadcrumbs.Item href="#settings">{t('تنظیمات', 'Settings')}</Breadcrumbs.Item>
              <Breadcrumbs.Item href="#shipping">{t('ارسال', 'Shipping')}</Breadcrumbs.Item>
              <Breadcrumbs.Item>{t('تیپاکس', 'Tipax')}</Breadcrumbs.Item>
            </Breadcrumbs>
          </Trail>
          <h2 className="text-foreground" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {t('تیپاکس', 'Tipax')}
          </h2>
          <p className="text-muted" style={{ margin: 0, fontSize: 14 }}>
            {t(
              'هزینهٔ ارسال با تیپاکس و شهرهایی که به آن‌ها می‌فرستید.',
              'What sending by Tipax costs, and the cities you send to.',
            )}
          </p>
        </header>
      </Stage>
    )
  },
}

// ---- everywhere it is drawn ----------------------------------------------------------------------

function Sample() {
  const t = useT()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Trail>
        <Breadcrumbs>
          {toAnOrder(t).map((step) => (
            <Breadcrumbs.Item key={step.name} href={step.href}>
              {step.name}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </Trail>
      <Trail>
        <Breadcrumbs>
          {toAProduct(t).map((step, i) => (
            <Breadcrumbs.Item key={step.name} href={step.href}>
              {i === 0 ? (
                <WithIcon icon={<House aria-hidden size={14} />}>{step.name}</WithIcon>
              ) : (
                step.name
              )}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </Trail>
      <Trail>
        <Breadcrumbs isDisabled>
          {toAnOrder(t).map((step) => (
            <Breadcrumbs.Item key={step.name} href={step.href}>
              {step.name}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
      </Trail>
    </div>
  )
}

/** The light theme and the dark, side by side, whatever the toolbar says. */
export const LightAndDark: StoryObj = {
  render: () => (
    <Themes>
      <Sample />
    </Themes>
  ),
}

/** A Persian page and an English one: the trail runs with the reading, the chevron turned with it. */
export const RightToLeft: StoryObj = {
  name: 'Right to left and left to right',
  render: () => (
    <Directions>
      <Sample />
    </Directions>
  ),
}

/** On a phone's width. */
export const OnAPhone: StoryObj = {
  render: () => (
    <Device>
      <Sample />
    </Device>
  ),
}

/** The same trail as a tree, the block an app or the server sends. */
export const ServerDriven: StoryObj = {
  name: 'As a block (SDUI)',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Breadcrumbs',
      children: toAnOrder(t).map((step) => ({
        type: 'BreadcrumbsItem',
        props: step.href ? { href: `/admin/${step.href.slice(1)}` } : {},
        children: step.name,
      })),
    }
    return (
      <Grid min={320}>
        <Example
          title={t('آنچه کشیده می‌شود', 'What is drawn')}
          note={t('در وب و در Flutter', 'On the web and in Flutter')}
        >
          {/* The block is its own nav: a Trail round it would be a second one. */}
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
