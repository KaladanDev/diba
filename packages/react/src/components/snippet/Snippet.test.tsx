import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { DibaProvider } from '../../provider/DibaProvider'
import { Snippet } from './Snippet'

/**
 * jsdom has no clipboard, and `userEvent.setup()`'s stub is only installed for
 * the events it drives. The component's whole contract is "what lands on the
 * clipboard", so the clipboard is stood up explicitly and asserted against.
 */
let written: string[] = []
let refuse = false

beforeEach(() => {
  written = []
  refuse = false
  // Defined onto the real navigator rather than swapping the whole object out:
  // a spread copy loses every prototype getter, and axe reads `userAgent`.
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: (text: string) => {
        if (refuse) return Promise.reject(new Error('denied'))
        written.push(text)
        return Promise.resolve()
      },
    },
  })
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'clipboard')
})

const show = (props: Partial<React.ComponentProps<typeof Snippet>> = {}) =>
  render(
    <DibaProvider locale="fa-IR" dir="rtl">
      <Snippet {...props}>{props.children ?? 'npm install @kaladan/diba-react'}</Snippet>
    </DibaProvider>,
  )

const copyButton = () => screen.getByRole('button', { name: 'رونوشت' })

describe('Snippet', () => {
  it('shows the command with the prompt it is given in front of it', () => {
    show({ symbol: '$' })
    expect(screen.getByText('npm install @kaladan/diba-react')).toBeInTheDocument()
    expect(document.querySelector('.db-snippet__symbol')).toHaveTextContent('$')
  })

  it('draws no prompt unless it is given one, as the block', () => {
    show()
    expect(document.querySelector('.db-snippet__symbol')).not.toBeInTheDocument()
  })

  it('carries its variant and size through to the classes', () => {
    show({ variant: 'secondary', size: 'lg' })
    expect(document.querySelector('[data-slot="snippet"]')).toHaveClass(
      'db-snippet',
      'db-snippet--secondary',
      'db-snippet--lg',
    )
  })

  describe('what lands on the clipboard', () => {
    /** The single thing this component must get right. */
    it('is the command, without the prompt drawn in front of it', async () => {
      show({ symbol: '$' })
      await userEvent.click(copyButton())
      await waitFor(() => expect(written).toEqual(['npm install @kaladan/diba-react']))
    })

    it('is every line, joined by newlines', async () => {
      show({ children: ['cd kits/diba', 'bun install', 'bun run build'] })
      await userEvent.click(copyButton())
      await waitFor(() => expect(written).toEqual(['cd kits/diba\nbun install\nbun run build']))
    })

    it('is whatever `copyText` says, when it says anything', async () => {
      show({ children: 'DB-1041…', copyText: 'DB-1041-FULL-ORDER-CODE' })
      await userEvent.click(copyButton())
      await waitFor(() => expect(written).toEqual(['DB-1041-FULL-ORDER-CODE']))
    })

    it('leaves a custom symbol behind too', async () => {
      show({ symbol: '>' })
      await userEvent.click(copyButton())
      await waitFor(() => expect(written[0]).not.toContain('>'))
    })
  })

  describe('saying whether it worked', () => {
    it('announces success rather than only drawing it', async () => {
      show()
      await userEvent.click(copyButton())
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('رونوشت شد'))
    })

    /** A tick over a clipboard that refused is a lie found at the paste. */
    it('says so when the browser refuses', async () => {
      refuse = true
      show()
      await userEvent.click(copyButton())
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('رونوشت انجام نشد'))
      expect(document.querySelector('[data-slot="snippet"]')).toHaveAttribute(
        'data-state',
        'failed',
      )
    })

    it('says nothing before anyone has pressed it', () => {
      show()
      expect(screen.getByRole('status')).toHaveTextContent('')
      expect(document.querySelector('[data-slot="snippet"]')).toHaveAttribute('data-state', 'idle')
    })

    it('reports the copied text to its caller', async () => {
      const onCopy = vi.fn()
      show({ onCopy })
      await userEvent.click(copyButton())
      await waitFor(() => expect(onCopy).toHaveBeenCalledWith('npm install @kaladan/diba-react'))
    })

    it('does not report a copy that never happened', async () => {
      refuse = true
      const onCopy = vi.fn()
      show({ onCopy })
      await userEvent.click(copyButton())
      await waitFor(() =>
        expect(document.querySelector('[data-slot="snippet"]')).toHaveAttribute(
          'data-state',
          'failed',
        ),
      )
      expect(onCopy).not.toHaveBeenCalled()
    })

    it('goes back to offering a copy', async () => {
      const snippet = () => document.querySelector('[data-slot="snippet"]')
      show()
      await userEvent.click(copyButton())
      await waitFor(() => expect(snippet()).toHaveAttribute('data-state', 'done'))
      // Real timers on purpose: the two seconds are the behaviour under test,
      // and a faked clock proves only that the number in the source is the
      // number in the test.
      await waitFor(() => expect(snippet()).toHaveAttribute('data-state', 'idle'), {
        timeout: 3500,
      })
    }, 8000)
  })

  describe('what can be left out', () => {
    it('the prompt, even when one is given', () => {
      show({ symbol: '$', hideSymbol: true })
      expect(document.querySelector('.db-snippet__symbol')).not.toBeInTheDocument()
    })

    it('the copy button', () => {
      show({ hideCopyButton: true })
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  it('has no axe violations', async () => {
    const { container } = show({ children: ['bun install', 'bun run build'] })
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
