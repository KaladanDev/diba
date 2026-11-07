import { useCallback, useEffect, useRef, useState, type ReactNode, type Ref } from 'react'
import { Button as ButtonPrimitive, TooltipTrigger } from 'react-aria-components'
import { Tooltip } from '../_internal/portals'
import { MaterialGlyph } from '../_internal/material-glyphs'
import { useDibaStrings } from '../../i18n/strings'
import { snippet } from './snippet.styles'

export { snippetOptions } from './snippet.styles'
export type { SnippetVariant, SnippetSize } from './snippet.styles'

/** How long the button reports success before going back to offering a copy. */
const DONE_MS = 2000

export interface SnippetProps {
  /** One line, or several — an array is one command per line. */
  children: string | string[]
  /** On the second surface, or outlined. @default 'default' */
  variant?: import('./snippet.styles').SnippetVariant
  /** @default 'md' */
  size?: import('./snippet.styles').SnippetSize
  /**
   * A prompt drawn before each line, such as `$` for a command. Drawn, never
   * copied — `$` is a picture of a shell, not part of the command. None unless
   * given, as the block's.
   */
  symbol?: ReactNode
  /** Drop the prompt even when one is given. */
  hideSymbol?: boolean
  /** For a snippet that is only there to be read. */
  hideCopyButton?: boolean
  /**
   * What actually goes on the clipboard. Defaults to the lines as written,
   * joined by newlines and without the prompt.
   */
  copyText?: string
  /** Called with the text that was copied, once it has been. */
  onCopy?: (text: string) => void
  className?: string
  ref?: Ref<HTMLDivElement>
}

/**
 * A command someone is meant to copy.
 *
 * The copy button is the component. Everything else — the frame, the prompt,
 * the monospace — is there to make a line of text look like something you can
 * take, and the one thing that must be exactly right is what lands on the
 * clipboard: the lines as written, joined by newlines, with the prompt left
 * behind. A `$` pasted into a shell is an error, and it is the kind of error
 * that gets blamed on the person pasting.
 *
 * Success is announced, not just drawn. A tick that only changes colour tells
 * a screen reader nothing, and "did that work?" is the entire question the
 * button exists to answer. A refused clipboard says so too, rather than
 * showing a tick over nothing.
 */
export function Snippet({
  children,
  variant,
  size,
  symbol,
  hideSymbol,
  hideCopyButton,
  copyText,
  onCopy,
  className,
  ref,
}: SnippetProps) {
  const t = useDibaStrings()
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const lines = Array.isArray(children) ? children : [children]
  const text = copyText ?? lines.join('\n')

  // A snippet unmounted inside the two seconds would otherwise set state on a
  // component that is gone.
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(text)
      setState('done')
      onCopy?.(text)
    } catch {
      // Insecure context, a denied permission, a browser without the API. Say
      // so — a tick over a clipboard that never took the text is a lie the
      // reader only discovers at the paste.
      setState('failed')
    }
    timer.current = setTimeout(() => setState('idle'), DONE_MS)
  }, [text, onCopy])

  const label = state === 'done' ? t.copied : state === 'failed' ? t.copyFailed : t.copy

  return (
    <div
      ref={ref}
      data-slot="snippet"
      data-state={state}
      className={snippet({ variant, size, className })}
    >
      <div className="db-snippet__code">
        {lines.map((line, i) => (
          <span key={`${line}-${i}`} className="db-snippet__line">
            {!hideSymbol && symbol ? (
              <span className="db-snippet__symbol" aria-hidden>
                {symbol}
              </span>
            ) : null}
            {line}
          </span>
        ))}
      </div>

      {hideCopyButton ? null : (
        <TooltipTrigger delay={400}>
          {/* Flutter's icon button: 40 round, Material's copy and tick 16 across. */}
          <ButtonPrimitive className="db-snippet__copy" aria-label={label} onPress={copy}>
            <MaterialGlyph name={state === 'done' ? 'check' : 'copy'} size={16} />
          </ButtonPrimitive>
          <Tooltip className="tooltip" placement="top" offset={10} data-slot="tooltip">
            {label}
          </Tooltip>
        </TooltipTrigger>
      )}

      {/*
        The outcome, for anyone not looking at the tick. Kept out of the flow
        rather than out of the tree: `display: none` is not announced.
      */}
      <span className="sr-only" role="status">
        {state === 'idle' ? '' : label}
      </span>
    </div>
  )
}
