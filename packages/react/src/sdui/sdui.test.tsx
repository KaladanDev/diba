import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { DibaNode } from '@kaladan/diba-schema'
import { DibaProvider } from '../provider/DibaProvider'
import { DibaSurface, type DibaSurfaceHandlers } from './Surface'
import { unrenderable, registry } from './registry'
import { isSafeUrl, isSafeImageUrl, checkTree } from './guards'

/**
 * The renderer is the trust boundary.
 *
 * Everything else in this library is first-party code rendering first-party
 * props. This is the one place a tree written by somebody else reaches the DOM,
 * so the interesting assertions are all about what does *not* happen: the prop
 * that is not forwarded, the URL that is not followed, the state key that is
 * not sent.
 *
 * Each refusal is checked twice — that the effect did not happen, and that the
 * host was told why. A silent drop is a worse failure than a loud one, because
 * an extension author debugging a panel that renders with one button missing
 * has nothing to go on.
 */

/** A panel of the kind an extension would actually send. */
const shippingPanel = {
  type: 'Stack',
  props: { direction: 'vertical', gap: 4 },
  children: [
    { type: 'Text', props: { weight: 'bold' }, children: 'برچسب ارسال' },
    {
      type: 'TextField',
      props: { label: 'وزن بسته' },
      actions: { onChange: { do: 'setState', key: 'weight' } },
    },
    {
      type: 'Button',
      props: { variant: 'primary' },
      children: 'چاپ برچسب',
      actions: { onPress: { do: 'call', action: 'label.print', with: ['weight'] } },
    },
  ],
} as unknown as DibaNode

function paint(
  tree: unknown,
  handlers?: DibaSurfaceHandlers,
  onRefuse?: (r: string) => void,
  locale = 'fa-IR',
) {
  return render(
    <DibaProvider ownsDocument={false} locale={locale}>
      <DibaSurface tree={tree as DibaNode} handlers={handlers} onRefuse={onRefuse} />
    </DibaProvider>,
  )
}

describe('the SDUI registry', () => {
  it('can render every component the manifest calls SDUI-safe', () => {
    expect(unrenderable).toEqual([])
    expect(Object.keys(registry).length).toBeGreaterThan(60)
  })
})

describe('DibaSurface renders a tree', () => {
  it('walks it and puts the real components on the page', () => {
    paint(shippingPanel)
    expect(screen.getByText('برچسب ارسال')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'چاپ برچسب' })).toBeInTheDocument()
    expect(screen.getByLabelText('وزن بسته')).toBeInTheDocument()
  })

  it('refuses a component it does not know', () => {
    const refused: string[] = []
    paint({ type: 'Malware', props: {} }, undefined, (r) => refused.push(r))
    expect(refused).toEqual(['unknown component: Malware'])
  })

  it('fills in the schema default where the tree said nothing', () => {
    paint({ type: 'Button', children: 'ثانویه' })
    // The schema's Button is secondary and small, as the admin's are; the copied Button's own default is primary.
    const button = screen.getByRole('button', { name: 'ثانویه' })
    expect(button.className).toMatch(/secondary/)
    expect(button.className).not.toMatch(/button--primary/)
  })
})

describe('DibaSurface refuses what the manifest never promised', () => {
  it('drops a prop the component does not declare', () => {
    const refused: string[] = []
    paint(
      {
        type: 'Text',
        props: { weight: 'bold', className: 'fixed inset-0 z-50', style: { position: 'fixed' } },
        children: 'سلام',
      },
      undefined,
      (r) => refused.push(r),
    )
    const el = screen.getByText('سلام')
    expect(el.className).not.toContain('fixed')
    expect(el.getAttribute('style') ?? '').not.toContain('position')
    expect(refused).toContain('Text: undeclared prop "className"')
    expect(refused).toContain('Text: undeclared prop "style"')
  })

  it('drops an event the component does not declare', () => {
    const refused: string[] = []
    paint(
      {
        type: 'Text',
        props: {},
        children: 'سلام',
        actions: { onPress: { do: 'call', action: 'x' } },
      },
      undefined,
      (r) => refused.push(r),
    )
    expect(refused).toContain('Text: undeclared action "onPress"')
  })

  /** URLs are guarded by prop, not by value. */
  it('refuses a URL prop that would run script, and draws the rest', () => {
    const refused: string[] = []
    paint(
      { type: 'Link', props: { href: 'javascript:alert(1)' }, children: 'جزئیات' },
      undefined,
      (r) => refused.push(r),
    )
    expect(refused).toContain('Link: refused value for "href"')
    expect(screen.getByText('جزئیات').closest('a')?.getAttribute('href') ?? '').not.toMatch(
      /javascript/,
    )
  })

  it('holds a picture to the image rule, which takes no mailto', () => {
    const refused: string[] = []
    paint(
      { type: 'Avatar', props: { name: 'نیلوفر رستمی', src: 'mailto:a@b.c' } },
      undefined,
      (r) => refused.push(r),
    )
    expect(refused).toContain('Avatar: refused value for "src"')
    // The initials stay, kept apart by a zero-width non-joiner.
    expect(screen.getByText('ن\u200cر')).toBeInTheDocument()
  })

  /**
   * The old guard refused any string that began with a word and a colon, in
   * any prop: "Warning: stock is low" was refused as if it were a URL.
   */
  it('lets plain text that reads like a scheme through', () => {
    const refused: string[] = []
    paint(
      {
        type: 'TextField',
        props: { label: 'Warning: stock is low', defaultValue: 'sku:123' },
      },
      undefined,
      (r) => refused.push(r),
    )
    expect(refused).toEqual([])
    expect(screen.getByLabelText('Warning: stock is low')).toHaveValue('sku:123')
  })

  /** Whole, not in part: half a panel looks to a merchant like a broken one. */
  it('refuses an oversized tree entirely', () => {
    let deep = { type: 'Text', children: 'x' } as Record<string, unknown>
    for (let i = 0; i < 40; i++) deep = { type: 'Stack', children: [deep] }
    const refused: string[] = []
    const { container } = paint(deep, undefined, (r) => refused.push(r))
    expect(refused[0]).toMatch(/deeper than/)
    expect(container.querySelector('.db-root')?.textContent).toBe('')
  })
})

describe('DibaSurface and the verbs', () => {
  it('keeps setState local — no host call', async () => {
    const call = vi.fn()
    paint(shippingPanel, { call })
    await userEvent.type(screen.getByLabelText('وزن بسته'), '۲')
    expect(call).not.toHaveBeenCalled()
  })

  it('sends a call with only the state the action asked for', async () => {
    const call = vi.fn()
    paint(shippingPanel, { call })
    await userEvent.type(screen.getByLabelText('وزن بسته'), '۲')
    await userEvent.click(screen.getByRole('button', { name: 'چاپ برچسب' }))
    expect(call).toHaveBeenCalledWith('label.print', { weight: '۲' })
  })

  it('does not hand the extension state it did not name', async () => {
    const call = vi.fn()
    const tree = structuredClone(shippingPanel) as unknown as {
      children: { actions?: { onPress?: { with?: string[] } } }[]
    }
    delete tree.children[2]!.actions!.onPress!.with
    paint(tree, { call })
    await userEvent.type(screen.getByLabelText('وزن بسته'), '۲')
    await userEvent.click(screen.getByRole('button', { name: 'چاپ برچسب' }))
    expect(call).toHaveBeenCalledWith('label.print', {})
  })

  it('follows a navigate the host can trust', async () => {
    const navigate = vi.fn()
    paint(
      {
        type: 'Button',
        children: 'برو',
        actions: { onPress: { do: 'navigate', to: '/orders/DB-1041' } },
      },
      { navigate },
    )
    await userEvent.click(screen.getByRole('button'))
    expect(navigate).toHaveBeenCalledWith('/orders/DB-1041')
  })

  it('refuses a navigate that is really a script', async () => {
    const navigate = vi.fn()
    const refused: string[] = []
    paint(
      {
        type: 'Button',
        children: 'برو',
        actions: { onPress: { do: 'navigate', to: 'javascript:alert(1)' } },
      },
      { navigate },
      (r) => refused.push(r),
    )
    await userEvent.click(screen.getByRole('button'))
    expect(navigate).not.toHaveBeenCalled()
    expect(refused[0]).toMatch(/refused URL/)
  })

  it('asks the host for one of its own destinations by name', async () => {
    const open = vi.fn()
    paint(
      {
        type: 'Button',
        children: 'راهنما',
        actions: { onPress: { do: 'open', target: 'help.shipping' } },
      },
      { open },
    )
    await userEvent.click(screen.getByRole('button'))
    expect(open).toHaveBeenCalledWith('help.shipping')
  })

  /**
   * A press hands back a PressEvent. Recording it would mean posting a live
   * object's enumerable properties to a third party the next time an action
   * named that key.
   */
  it('records nothing it could not safely send', async () => {
    const call = vi.fn()
    paint(
      {
        type: 'Stack',
        children: [
          {
            type: 'Button',
            children: 'یک',
            actions: { onPress: { do: 'setState', key: 'pressed' } },
          },
          {
            type: 'Button',
            children: 'دو',
            actions: { onPress: { do: 'call', action: 'x', with: ['pressed'] } },
          },
        ],
      },
      { call },
    )
    await userEvent.click(screen.getByRole('button', { name: 'یک' }))
    await userEvent.click(screen.getByRole('button', { name: 'دو' }))
    expect(call).toHaveBeenCalledWith('x', { pressed: null })
  })

  /** Without it, a row, a menu item or a removed tag cannot say which one it was. */
  it("sends the event's own value under the key the call names", async () => {
    const call = vi.fn()
    paint(
      {
        type: 'ListBox',
        props: { label: 'سفارش‌ها', selectionMode: 'none' },
        children: [
          { type: 'ListBoxItem', props: { id: 'DB-1041' }, children: 'سفارش ۱۰۴۱' },
          { type: 'ListBoxItem', props: { id: 'DB-1042' }, children: 'سفارش ۱۰۴۲' },
        ],
        actions: { onAction: { do: 'call', action: 'order.open', value: 'order' } },
      },
      { call },
    )
    await userEvent.click(screen.getByText('سفارش ۱۰۴۲'))
    expect(call).toHaveBeenCalledWith('order.open', { order: 'DB-1042' })
  })

  /** "Record the choice, then send it": each step reads what the one before wrote. */
  it('runs a list in order, each step seeing the one before', async () => {
    const call = vi.fn()
    paint(
      {
        type: 'Switch',
        props: { label: 'فعال' },
        actions: {
          onChange: [
            { do: 'setState', key: 'on' },
            { do: 'call', action: 'feature.toggle', with: ['on'] },
          ],
        },
      },
      { call },
    )
    await userEvent.click(screen.getByRole('switch'))
    expect(call).toHaveBeenCalledWith('feature.toggle', { on: true })
  })

  it('stops a list at a failed call, and says why', async () => {
    const toast = vi.fn()
    const refused: string[] = []
    paint(
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
      { call: () => Promise.reject(new Error('offline')), toast },
      (r) => refused.push(r),
    )
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(refused).toContain('call "note.save" failed: offline'))
    expect(toast).not.toHaveBeenCalled()
  })

  it('hands the host a toast, with an undo that runs its own actions', async () => {
    const toast = vi.fn()
    const call = vi.fn()
    paint(
      {
        type: 'Button',
        children: 'بایگانی',
        actions: {
          onPress: {
            do: 'toast',
            status: 'success',
            title: 'بایگانی شد',
            actionLabel: 'برگرداندن',
            onAction: { do: 'call', action: 'order.unarchive' },
          },
        },
      },
      { toast, call },
    )
    await userEvent.click(screen.getByRole('button'))
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', title: 'بایگانی شد', actionLabel: 'برگرداندن' }),
    )
    toast.mock.calls[0]![0].onAction()
    await waitFor(() => expect(call).toHaveBeenCalledWith('order.unarchive', {}))
  })

  it('will not let a toast summon another toast', async () => {
    const toast = vi.fn()
    const refused: string[] = []
    paint(
      {
        type: 'Button',
        children: 'x',
        actions: {
          onPress: {
            do: 'toast',
            title: 'یک',
            actionLabel: 'دو',
            onAction: [{ do: 'toast', title: 'دو' }],
          },
        },
      },
      { toast },
      (r) => refused.push(r),
    )
    await userEvent.click(screen.getByRole('button'))
    expect(refused).toContain('toast: a toast inside onAction')
    // With nothing left to run, the undo is dropped too.
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ actionLabel: undefined }))
  })

  it('refuses a close with no overlay open', async () => {
    const refused: string[] = []
    paint(
      { type: 'Button', children: 'بستن', actions: { onPress: { do: 'close' } } },
      undefined,
      (r) => refused.push(r),
    )
    await userEvent.click(screen.getByRole('button'))
    expect(refused).toEqual(['close with no overlay open'])
  })
})

/**
 * Slots are the third thing a node can carry, beside props and children. Every
 * overlay in a tree opens from its trigger, and only from it.
 */
describe('DibaSurface and slots', () => {
  const modal = {
    type: 'Modal',
    props: { title: 'تأیید حذف' },
    slots: {
      trigger: { type: 'Button', children: 'حذف' },
      footer: {
        type: 'Button',
        children: 'انصراف',
        actions: { onPress: { do: 'close' } },
      },
    },
    children: [{ type: 'Text', children: 'این کار بازگشت‌پذیر نیست.' }],
  }

  it('a trigger opens the overlay it belongs to', async () => {
    paint(modal)
    expect(screen.getByRole('button', { name: 'حذف' })).toBeInTheDocument()
    expect(screen.queryByText('این کار بازگشت‌پذیر نیست.')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'حذف' }))
    expect(await screen.findByText('این کار بازگشت‌پذیر نیست.')).toBeInTheDocument()
  })

  it('close shuts the overlay this tree opened', async () => {
    const refused: string[] = []
    paint(modal, undefined, (r) => refused.push(r))
    await userEvent.click(screen.getByRole('button', { name: 'حذف' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'انصراف' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(refused).toEqual([])
  })

  it('refuses an overlay with no trigger', () => {
    const refused: string[] = []
    paint({ type: 'Modal', props: { title: 'x' } }, undefined, (r) => refused.push(r))
    expect(refused).toContain('Modal: no trigger')
  })

  it('refuses a slot the component does not declare', () => {
    const refused: string[] = []
    paint(
      {
        type: 'Modal',
        props: { title: 'x' },
        slots: {
          trigger: { type: 'Button', children: 'حذف' },
          sidecar: { type: 'Text', children: 'x' },
        },
      },
      undefined,
      (r) => refused.push(r),
    )
    expect(refused).toContain('Modal: undeclared slot "sidecar"')
    expect(screen.queryByText('x')).toBeNull()
  })

  it('refuses a node in a slot on the same terms as any other', () => {
    const refused: string[] = []
    paint({ type: 'Card', slots: { footer: { type: 'Malware' } } }, undefined, (r) =>
      refused.push(r),
    )
    expect(refused).toContain('unknown component: Malware')
  })

  /** A link inside a link is broken for keyboards and screen readers. */
  it("refuses a card's href over interactive content, and keeps the content", () => {
    const refused: string[] = []
    paint(
      {
        type: 'Card',
        props: { title: 'سفارش', href: '/orders/DB-1041' },
        children: [{ type: 'Button', children: 'ارسال' }],
      },
      undefined,
      (r) => refused.push(r),
    )
    expect(refused).toContain('Card: href over interactive content')
    expect(screen.getByRole('button', { name: 'ارسال' }).closest('a')).toBeNull()
  })

  it('makes a card with nothing to press a link', () => {
    paint({
      type: 'Card',
      props: { title: 'سفارش', href: '/orders/DB-1041' },
      children: [{ type: 'Text', children: 'سه قلم' }],
    })
    expect(screen.getByText('سه قلم').closest('a')?.getAttribute('href')).toBe('/orders/DB-1041')
  })
})

/**
 * Every value has a pair: the default form starts at a value the
 * merchant changes; the pinned form shows exactly what the server sent until
 * the next tree.
 */
describe('DibaSurface and value pairs', () => {
  it('a default value can be typed over', async () => {
    paint({ type: 'TextField', props: { label: 'نام', defaultValue: 'دیبا' } })
    const input = screen.getByLabelText('نام')
    await userEvent.clear(input)
    await userEvent.type(input, 'کالا')
    expect(input).toHaveValue('کالا')
  })

  it('a pinned value stays what the server sent, though the event still fires', async () => {
    const call = vi.fn()
    paint(
      {
        type: 'Checkbox',
        props: { label: 'منتشر شده', isSelected: true },
        actions: { onChange: { do: 'call', action: 'publish', value: 'on' } },
      },
      { call },
    )
    const box = screen.getByRole('checkbox')
    await userEvent.click(box)
    expect(call).toHaveBeenCalledWith('publish', { on: false })
    expect(box).toBeChecked()
  })
})

/**
 * A Form checks its fields first, in Diba's own words, then hands its
 * action the named fields and nothing else.
 */
describe('DibaSurface and forms', () => {
  const form = {
    type: 'Form',
    actions: { onSubmit: { do: 'call', action: 'store.save', with: ['note'] } },
    children: [
      { type: 'TextField', props: { label: 'نام فروشگاه', name: 'title', isRequired: true } },
      {
        type: 'TextField',
        props: { label: 'ایمیل', name: 'email', type: 'email', defaultValue: 'a@kaladan.shop' },
      },
      { type: 'Checkbox', props: { label: 'خبرنامه', name: 'news' } },
      { type: 'Button', props: { type: 'submit', variant: 'primary' }, children: 'ذخیره' },
      { type: 'Button', props: { type: 'reset' }, children: 'از نو' },
    ],
  }

  it('shows the check in Persian and does not submit', async () => {
    const call = vi.fn()
    paint(form, { call })
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))
    expect(await screen.findByText('این فیلد الزامی است.')).toBeInTheDocument()
    expect(call).not.toHaveBeenCalled()
  })

  it('in English on an English page', async () => {
    paint(form, { call: vi.fn() }, undefined, 'en-US')
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))
    expect(await screen.findByText('This field is required.')).toBeInTheDocument()
  })

  it('checks an email by Diba’s rule', async () => {
    paint(form, { call: vi.fn() })
    await userEvent.type(screen.getByLabelText('نام فروشگاه'), 'دیبا')
    await userEvent.clear(screen.getByLabelText('ایمیل'))
    await userEvent.type(screen.getByLabelText('ایمیل'), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))
    expect(await screen.findByText('نشانی ایمیل درست نیست.')).toBeInTheDocument()
  })

  it('sends the named fields, a lone checkbox as a boolean, merged with its keys', async () => {
    const call = vi.fn()
    paint(form, { call })
    await userEvent.type(screen.getByLabelText('نام فروشگاه'), 'دیبا')
    await userEvent.click(screen.getByRole('button', { name: 'ذخیره' }))
    await waitFor(() =>
      expect(call).toHaveBeenCalledWith('store.save', {
        title: 'دیبا',
        email: 'a@kaladan.shop',
        news: false,
        note: null,
      }),
    )
  })

  it('a reset restores every field to its default', async () => {
    paint(form, { call: vi.fn() })
    const email = screen.getByLabelText('ایمیل')
    await userEvent.clear(email)
    await userEvent.type(email, 'b@kaladan.shop')
    await userEvent.click(screen.getByRole('button', { name: 'از نو' }))
    await waitFor(() => expect(screen.getByLabelText('ایمیل')).toHaveValue('a@kaladan.shop'))
  })
})

describe('a closed Select shows its choice', () => {
  const option = (id: string, text: string, props: Record<string, unknown> = {}) => ({
    type: 'ListBoxItem',
    props: { id, ...props },
    children: text,
  })

  it("as the option's icon and text on one line, without its second line or tick", () => {
    const { container } = paint(
      {
        type: 'Select',
        props: { label: 'Shipping', defaultSelectedKey: 'tipax' },
        children: [
          {
            type: 'ListBoxSection',
            props: { title: 'Courier' },
            children: [option('tipax', 'Tipax', { icon: 'truck', description: '2 to 3 days' })],
          },
        ],
      },
      undefined,
      undefined,
      'en-US',
    )
    const value = container.querySelector('[data-slot="select-value"]')!
    expect(value.textContent).toBe('Tipax')
    expect(value.querySelector('svg.lucide-truck')).not.toBeNull()
    expect(value.querySelector('[data-slot="description"], .list-box-item__indicator')).toBeNull()
  })

  it('as one list when several are chosen, never one word to a line', () => {
    const { container } = paint(
      {
        type: 'Select',
        props: { label: 'Labels', selectionMode: 'multiple', defaultSelectedKeys: ['new', 'sale'] },
        children: [option('new', 'New'), option('sale', 'Sale'), option('gift', 'Gift')],
      },
      undefined,
      undefined,
      'en-US',
    )
    const value = container.querySelector('[data-slot="select-value"]')!
    expect(value.textContent).toBe('New and Sale')
    expect(value.querySelector('.label, .list-box-item__indicator')).toBeNull()
  })
})

describe('AlertDialog waits for its call', () => {
  it('keeps confirm pending until the host answers, then closes', async () => {
    let answer: () => void = () => {}
    const call = vi.fn(() => new Promise<void>((resolve) => (answer = resolve)))
    paint(
      {
        type: 'AlertDialog',
        props: { title: 'حذف محصول؟', confirmLabel: 'حذف' },
        slots: { trigger: { type: 'Button', children: 'حذف محصول' } },
        actions: { onConfirm: { do: 'call', action: 'product.delete' } },
      },
      { call },
    )
    await userEvent.click(screen.getByRole('button', { name: 'حذف محصول' }))
    const dialog = await screen.findByRole('alertdialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'حذف' }))
    expect(call).toHaveBeenCalledWith('product.delete', {})
    expect(within(dialog).getByRole('button', { name: 'حذف' })).toHaveAttribute('data-pending')
    answer()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })
})

describe('the guards on their own', () => {
  it.each([
    ['/orders/1', true],
    ['#top', true],
    ['https://kaladan.dev', true],
    ['mailto:a@b.c', true],
    ['javascript:alert(1)', false],
    ['JavaScript:alert(1)', false],
    ['  javascript:alert(1)', false],
    ['data:text/html,<script>', false],
    ['vbscript:msgbox', false],
  ])('isSafeUrl(%s) → %s', (url, expected) => {
    expect(isSafeUrl(url as string)).toBe(expected)
  })

  it.each([
    ['/media/a.png', true],
    ['https://cdn.kaladan.dev/a.webp', true],
    ['data:image/png;base64,AAAA', true],
    ['mailto:a@b.c', false],
    ['tel:+98', false],
    ['', false],
    ['javascript:alert(1)', false],
  ])('isSafeImageUrl(%s) → %s', (url, expected) => {
    expect(isSafeImageUrl(url as string)).toBe(expected)
  })

  it('counts nodes, not just depth', () => {
    const wide = {
      type: 'Stack',
      children: Array.from({ length: 40 }, () => ({ type: 'Text', children: 'x' })),
    }
    expect(checkTree(wide, { depth: 32, nodes: 10 }).ok).toBe(false)
    expect(checkTree(wide, { depth: 32, nodes: 100 }).ok).toBe(true)
  })

  it('counts what is in slots, too', () => {
    const hidden = {
      type: 'Modal',
      slots: {
        trigger: { type: 'Button', children: 'x' },
        footer: {
          type: 'Stack',
          children: Array.from({ length: 40 }, () => ({ type: 'Text', children: 'x' })),
        },
      },
    }
    expect(checkTree(hidden, { depth: 32, nodes: 10 }).ok).toBe(false)
  })
})
