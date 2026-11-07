import type { Meta, StoryObj } from '@storybook/react-vite'
import { manifest, type DibaNode } from '@kaladan/diba-schema'
import { useLocale } from 'react-aria-components'
import samples from '../../../schema/fixtures/samples.json'
import { Card } from '../components/card'
import { ToastProvider } from '../components/toast'
import { DibaSurface } from '../sdui'
import { clean } from '../stories/docs'
import { Example, Grid, useT } from '../stories/kit'

// Every block, drawn from the sample trees both platforms are tested against, and the whole
// catalogue by kind. The docs page is Blocks.mdx. A line comment, not a doc comment: the docs
// plugin replaces a commented meta's parameters with one.
const meta = {
  title: 'SDUI/Blocks',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

type Sample = { id: string; title: string; note?: string | null; tree: unknown }
type Group = { id: string; title: string; samples: Sample[] }
const groups = samples as unknown as { fa: Group[]; en: Group[] }

/** One group of the samples, in the page's language. */
function Samples({ id }: { id: string }) {
  const { locale } = useLocale()
  const persian = locale.toLowerCase().startsWith('fa')
  const group = (persian ? groups.fa : groups.en).find((g) => g.id === id)!
  return (
    <>
      {/* The region the samples' toasts show in; it sits beside the page, not around it. */}
      <ToastProvider />
      <Grid min={320}>
        {group.samples.map((s) => (
          <Example key={s.id} title={s.title.replace(/^\d+\s*·\s*/, '')}>
            <Card>
              <Card.Content>
                <DibaSurface tree={s.tree as DibaNode} />
              </Card.Content>
            </Card>
          </Example>
        ))}
      </Grid>
    </>
  )
}

export const Actions: StoryObj = { render: () => <Samples id="actions" /> }
export const TextFields: StoryObj = { name: 'Text fields', render: () => <Samples id="fields" /> }
export const Pickers: StoryObj = { render: () => <Samples id="pickers" /> }
export const Choices: StoryObj = { render: () => <Samples id="choices" /> }
export const Status: StoryObj = { render: () => <Samples id="status" /> }
export const Containers: StoryObj = { render: () => <Samples id="containers" /> }

type Spec = { category?: string; description?: string; children?: { accepts: unknown } }

/** Every block the manifest declares, by kind, with what it is. */
export const Catalogue: StoryObj = {
  name: 'Every block',
  render: function Render() {
    const t = useT()
    const kinds: Record<string, [string, string]> = {
      layout: ['چیدمان', 'Layout'],
      content: ['محتوا', 'Content'],
      controls: ['کنترل‌ها', 'Controls'],
      form: ['فرم', 'Forms'],
      navigation: ['پیمایش', 'Navigation'],
      feedback: ['بازخورد و پنجره‌ها', 'Feedback and overlays'],
      data: ['داده', 'Data'],
    }
    const components = manifest.components as Record<string, Spec>
    const byKind = new Map<string, [string, Spec][]>()
    for (const [name, spec] of Object.entries(components)) {
      const kind = spec.category ?? 'other'
      byKind.set(kind, [...(byKind.get(kind) ?? []), [name, spec]])
    }
    return (
      <div style={{ display: 'grid', gap: 24 }}>
        {Object.keys(kinds)
          .filter((k) => byKind.has(k))
          .map((kind) => (
            <Example key={kind} title={t(...kinds[kind]!)} note={`${byKind.get(kind)!.length}`}>
              <table dir="ltr" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {byKind
                    .get(kind)!
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([name, spec]) => (
                      <tr key={name}>
                        <td
                          style={{
                            padding: '6px 8px',
                            borderBottom: '1px solid var(--separator)',
                            whiteSpace: 'nowrap',
                            verticalAlign: 'top',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: 12,
                            color: 'var(--foreground)',
                          }}
                        >
                          {name}
                        </td>
                        <td
                          style={{
                            padding: '6px 8px',
                            borderBottom: '1px solid var(--separator)',
                            color: 'var(--muted)',
                          }}
                        >
                          {clean(spec.description)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Example>
          ))}
      </div>
    )
  },
}
