import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { validateTree } from '@kaladan/diba-schema/validate'
import { DibaExtension, type DibaRequest, type DibaResponse } from './Extension'
import { Card } from '../components/card'
import { Spinner } from '../components/spinner'
import { Grid, useT } from '../stories/kit'
import { Heading, Log } from '../stories/sdui'

// A third-party app's panel: fetched, validated, drawn and sent back to, against a fake server.
// The docs page is Extensions.mdx. A line comment, not a doc comment: the docs plugin replaces a
// commented meta's parameters with one.
const meta = {
  title: 'SDUI/Extensions',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** What an extension's backend does: a panel for the order, and what printing returns. */
function shippingServer(persian: boolean) {
  const t = (fa: string, en: string) => (persian ? fa : en)
  return async (request: DibaRequest): Promise<DibaResponse> => {
    await sleep(600)
    if (request.action?.name === 'label.print') {
      const weight = request.action.payload.weight ?? '—'
      return {
        tree: {
          type: 'Stack',
          props: { gap: 3 },
          children: [
            {
              type: 'Text',
              props: { weight: 'semibold' },
              children: t('برچسب صادر شد', 'Label issued'),
            },
            {
              type: 'Text',
              props: { tone: 'muted', size: 'sm' },
              children: t(`وزن: ${weight} گرم`, `Weight: ${weight} g`),
            },
            { type: 'Snippet', children: `TIPAX-${String(request.context?.orderId ?? '')}` },
          ],
        },
        effect: { status: 'success', title: t('برچسب چاپ شد', 'Label printed') },
      }
    }
    return {
      tree: {
        type: 'Stack',
        props: { gap: 3 },
        children: [
          {
            type: 'Text',
            props: { size: 'lg', weight: 'semibold' },
            children: t('برچسب ارسال', 'Shipping label'),
          },
          {
            type: 'Text',
            props: { tone: 'muted', size: 'sm' },
            children: t(
              `سفارش ${String(request.context?.orderId)}`,
              `Order ${String(request.context?.orderId)}`,
            ),
          },
          {
            type: 'NumberField',
            props: { label: t('وزن بسته (گرم)', 'Parcel weight (g)'), minValue: 1 },
            actions: { onChange: { do: 'setState', key: 'weight' } },
          },
          {
            type: 'Button',
            props: { variant: 'primary', fullWidth: true },
            children: t('چاپ برچسب', 'Print the label'),
            actions: { onPress: { do: 'call', action: 'label.print', with: ['weight'] } },
          },
        ],
      },
    }
  }
}

/** A panel and what passed between the host and the extension. */
function Panel({
  transport,
  surface = 'order.detail.sidebar',
}: {
  transport: (request: DibaRequest) => Promise<DibaResponse>
  surface?: string
}) {
  const t = useT()
  const [log, setLog] = useState<string[]>([])
  const add = (line: string) => setLog((l) => [...l, line])
  return (
    <Grid min={320}>
      <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
        <Heading>{t('پنل افزونه', 'The extension’s panel')}</Heading>
        <Card>
          <Card.Content>
            <DibaExtension
              surface={surface}
              context={{ orderId: 'DB-1041' }}
              transport={async (request) => {
                add(`→ ${JSON.stringify(request)}`)
                try {
                  const response = await transport(request)
                  add(
                    `← ${response.tree ? 'tree' : 'no tree'}${response.effect ? ` + effect ${JSON.stringify(response.effect)}` : ''}`,
                  )
                  return response
                } catch (error) {
                  add(`← ${String(error)}`)
                  throw error
                }
              }}
              validate={validateTree}
              onEffect={(effect) => add(`onEffect ${JSON.stringify(effect)}`)}
              onRefuse={(reason) => queueMicrotask(() => add(`refused: ${reason}`))}
              pending={<Spinner aria-label={t('در حال بارگذاری', 'Loading')} />}
              fallback={(reasons) => (
                <p className="text-danger" style={{ margin: 0, fontSize: 14 }}>
                  {t('این پنل باز نشد.', 'This panel could not open.')} {reasons[0]}
                </p>
              )}
            />
          </Card.Content>
        </Card>
      </div>
      <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
        <Heading>{t('میان میزبان و افزونه', 'Between the host and the extension')}</Heading>
        <Log lines={log} empty={t('هنوز چیزی نرفته.', 'Nothing yet.')} />
      </div>
    </Grid>
  )
}

/** Fetched, validated and drawn; a press goes back to the same server, and its answer replaces it. */
export const RoundTrip: StoryObj = {
  name: 'The round trip',
  render: function Render() {
    const t = useT()
    return <Panel transport={shippingServer(t('fa', 'en') === 'fa')} />
  },
}

/** A server that answers with a tree the schema refuses: the fallback shows, with why. */
export const AnInvalidTree: StoryObj = {
  name: 'An invalid tree',
  render: () => (
    <Panel
      transport={async () => {
        await sleep(400)
        return { tree: { type: 'Button', props: { variant: 'nonsense' }, children: 'OK' } }
      }}
    />
  ),
}

/** A server that does not answer: the fallback shows. */
export const NoAnswer: StoryObj = {
  name: 'No answer',
  render: () => (
    <Panel
      transport={async () => {
        await sleep(400)
        throw new Error('timeout')
      }}
    />
  ),
}
