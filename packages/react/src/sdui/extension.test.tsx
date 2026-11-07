import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { validateTree } from '@kaladan/diba-schema/validate'
import { DibaProvider } from '../provider/DibaProvider'
import { DibaExtension, type DibaRequest, type DibaResponse } from './Extension'

/**
 * The round trip, from fetch to press to the tree that comes back.
 *
 * The renderer is tested next door and the schema in the schema package; this
 * is the part that joins them, and the interesting failures are all about
 * ordering and trust: a tree rendered before it was checked, a response applied
 * after the surface moved on, a press that reaches the extension without the
 * context it needs.
 *
 * The transport is a function, so none of this needs a network — which is also
 * the argument for it being a function.
 */

const panel = (label: string) => ({
  type: 'Stack',
  children: [
    { type: 'Text', children: label },
    {
      type: 'Button',
      children: 'چاپ',
      actions: { onPress: { do: 'call', action: 'label.print' } },
    },
  ],
})

function mount(
  transport: (req: DibaRequest) => Promise<DibaResponse>,
  extra: Partial<React.ComponentProps<typeof DibaExtension>> = {},
) {
  const refused: string[] = []
  const view = render(
    <DibaProvider ownsDocument={false}>
      <DibaExtension
        surface="order.detail.sidebar"
        context={{ orderId: 'DB-1041' }}
        transport={transport}
        validate={validateTree}
        onRefuse={(r) => refused.push(r)}
        pending={<span>در حال بارگذاری</span>}
        fallback={(reasons) => <span>{`ناموفق: ${reasons[0]}`}</span>}
        {...extra}
      />
    </DibaProvider>,
  )
  return { ...view, refused }
}

describe('DibaExtension fetches and renders', () => {
  it('asks for the surface, with the context the host already has', async () => {
    const transport = vi.fn(async () => ({ tree: panel('برچسب') }))
    mount(transport)
    await screen.findByText('برچسب')
    expect(transport).toHaveBeenCalledWith({
      surface: 'order.detail.sidebar',
      context: { orderId: 'DB-1041' },
    })
  })

  it('shows the pending slot until the tree arrives', async () => {
    let release: (r: DibaResponse) => void = () => {}
    mount(() => new Promise<DibaResponse>((r) => (release = r)))
    expect(screen.getByText('در حال بارگذاری')).toBeInTheDocument()
    release({ tree: panel('رسید') })
    await screen.findByText('رسید')
  })
})

describe('DibaExtension will not render what it has not checked', () => {
  it('refuses an invalid tree whole, and says why', async () => {
    const { refused } = mount(async () => ({
      tree: { type: 'Button', props: { variant: 'nonsense' }, children: 'x' },
    }))
    await screen.findByText(/ناموفق/)
    expect(screen.queryByRole('button')).toBeNull()
    expect(refused.join('\n')).toMatch(/variant/)
  })

  /**
   * The response channel is not a way around validation. A second tree gets the
   * same treatment as the first, or an extension could send a good panel and
   * then anything it liked.
   */
  it('checks the tree that comes back from an action too', async () => {
    const transport = vi.fn(async (req: DibaRequest) =>
      req.action ? { tree: { type: 'Malware' } } : { tree: panel('برچسب') },
    )
    const { refused } = mount(transport)
    await screen.findByText('برچسب')
    await userEvent.click(screen.getByRole('button'))
    await screen.findByText(/ناموفق/)
    expect(refused.join('\n')).toMatch(/Malware/)
  })

  it('survives a transport that throws', async () => {
    const { refused } = mount(async () => {
      throw new Error('gateway timeout')
    })
    await screen.findByText('ناموفق: gateway timeout')
    expect(refused[0]).toBe('transport failed: gateway timeout')
  })
})

describe('DibaExtension sends actions back', () => {
  it('carries the action name, the payload and the context', async () => {
    const transport = vi.fn(async (req: DibaRequest) =>
      req.action ? { tree: panel('چاپ شد') } : { tree: panel('برچسب') },
    )
    mount(transport)
    await screen.findByText('برچسب')
    await userEvent.click(screen.getByRole('button'))

    expect(transport).toHaveBeenLastCalledWith({
      surface: 'order.detail.sidebar',
      context: { orderId: 'DB-1041' },
      action: { name: 'label.print', payload: {} },
    })
    await screen.findByText('چاپ شد')
  })

  it('replaces the panel with what came back', async () => {
    const transport = async (req: DibaRequest) => ({
      tree: panel(req.action ? 'دوم' : 'اول'),
    })
    mount(transport)
    await screen.findByText('اول')
    await userEvent.click(screen.getByRole('button'))
    await screen.findByText('دوم')
    expect(screen.queryByText('اول')).toBeNull()
  })

  it('leaves the panel alone when the response carries no tree', async () => {
    const transport = async (req: DibaRequest) => (req.action ? {} : { tree: panel('برچسب') })
    mount(transport)
    await screen.findByText('برچسب')
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByText('برچسب')).toBeInTheDocument())
  })
})

/**
 * Some things an extension wants are not shaped like a tree: the toast after a
 * save belongs to the answer, not to the panel. It uses the `toast` verb's
 * words, `status`, `title` and `description`.
 */
describe('DibaExtension and host effects', () => {
  it('hands a toast to the host', async () => {
    const onEffect = vi.fn()
    mount(async () => ({ tree: panel('x'), effect: { status: 'success', title: 'چاپ شد' } }), {
      onEffect,
    })
    await screen.findByText('x')
    expect(onEffect).toHaveBeenCalledWith({ status: 'success', title: 'چاپ شد' })
  })

  it('holds an effect navigate to the same rule as the verb', async () => {
    const onEffect = vi.fn()
    const { refused } = mount(
      async () => ({ effect: { navigate: 'javascript:alert(1)', title: 'ok' } }),
      { onEffect },
    )
    await waitFor(() => expect(onEffect).toHaveBeenCalled())
    // The toast still arrives; only the URL is dropped.
    expect(onEffect).toHaveBeenCalledWith({ title: 'ok' })
    expect(refused[0]).toMatch(/refused URL/)
  })

  it('lets a safe effect navigate through', async () => {
    const onEffect = vi.fn()
    mount(async () => ({ effect: { navigate: '/orders/DB-1041' } }), { onEffect })
    await waitFor(() => expect(onEffect).toHaveBeenCalled())
    expect(onEffect).toHaveBeenCalledWith({ navigate: '/orders/DB-1041' })
  })
})

/**
 * A `call` resolves when the extension has answered, and an extension
 * that cannot be reached stops the rest of the event's list: "save, then
 * close" must not close a dialog whose save did not happen.
 */
describe('DibaExtension and the calls it carries', () => {
  const saving = {
    type: 'Stack',
    children: [
      {
        type: 'Button',
        children: 'ذخیره',
        actions: {
          onPress: [
            { do: 'call', action: 'note.save' },
            { do: 'toast', status: 'success', title: 'ذخیره شد' },
          ],
        },
      },
    ],
  }

  it('runs the rest of the list once the extension answers', async () => {
    const toast = vi.fn()
    mount(async () => ({ tree: saving }), { handlers: { toast } })
    await userEvent.click(await screen.findByRole('button', { name: 'ذخیره' }))
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'ذخیره شد' })),
    )
  })

  it('stops the list when the extension cannot be reached', async () => {
    const toast = vi.fn()
    const transport = async (req: DibaRequest) => {
      if (req.action) throw new Error('offline')
      return { tree: saving }
    }
    const { refused } = mount(transport, { handlers: { toast } })
    await userEvent.click(await screen.findByRole('button', { name: 'ذخیره' }))
    await waitFor(() =>
      expect(refused).toContain('call "note.save" failed: the extension did not answer'),
    )
    expect(toast).not.toHaveBeenCalled()
  })
})

/**
 * An answer to a call whose tree may not be drawn is a failed call: the rest of the list stops, as
 * it does in Flutter, so a toast saying it worked never shows (2026-11-07). It had run on.
 */
describe('DibaExtension stops a list on an answer it cannot draw', () => {
  it('shows no toast after a call answered with an invalid tree', async () => {
    const toast = vi.fn()
    const first = {
      type: 'Button',
      children: 'ذخیره',
      actions: {
        onPress: [
          { do: 'call', action: 'save' },
          { do: 'toast', status: 'success', title: 'ذخیره شد' },
        ],
      },
    }
    const { refused } = mount(
      async (req) =>
        req.action
          ? { tree: { type: 'Button', props: { variant: 'nonsense' }, children: 'x' } }
          : { tree: first },
      { handlers: { toast } },
    )
    await userEvent.click(await screen.findByRole('button', { name: 'ذخیره' }))
    await screen.findByText(/ناموفق/)
    await new Promise((r) => setTimeout(r, 20))
    expect(toast).not.toHaveBeenCalled()
    expect(refused.join(' ')).toMatch(
      /call "save" failed: the extension answered with a tree it may not draw/,
    )
  })
})
