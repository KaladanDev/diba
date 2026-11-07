import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { UNSAFE_PortalProvider } from 'react-aria'
import { I18nProvider } from 'react-aria-components'
import { installPersianAriaStrings } from '../i18n/aria-fa'
import { StringsContext, type DibaStrings } from '../i18n/strings'
import { PortalContext, overlayLayer } from './portal'
import { cn } from '../utils/cn'

export type DibaTheme = 'light' | 'dark'
export type DibaDir = 'rtl' | 'ltr'

export interface DibaProviderProps {
  /** Token theme applied via `data-theme` (swaps the semantic CSS variables). */
  theme?: DibaTheme
  /** BCP-47 locale, e.g. `fa-IR` or `en-US`. Drives React Aria i18n and the default direction. */
  locale?: string
  /** Text direction. Defaults to the locale's natural direction. */
  dir?: DibaDir
  /**
   * Override any of Diba's built-in strings — a merchant who says "Add to bag"
   * rather than "Add to cart", or who ships a locale Diba does not carry.
   */
  strings?: Partial<DibaStrings>
  /**
   * Hand React Aria Diba's Persian strings on a Persian locale — its own
   * "Previous", "Number field", sort announcements and date-segment names,
   * none of which it ships in Persian.
   *
   * Global and single-locale, because that is the shape of React Aria's
   * registry: an English subtree inside a Persian app would read them too.
   * Turn it off on a page that genuinely mixes languages.
   * @default true
   */
  ariaStrings?: boolean
  /**
   * Whether this provider reflects its theme, direction and locale onto
   * `<html>`.
   *
   * Left undefined it claims the document only if no other provider already
   * has, which is what makes a second provider safe to mount. Pass `false` for
   * one rendering inside a host you do not own — a third-party panel in the
   * admin — where writing to `<html>` would re-theme somebody else's page.
   * Pass `true` to take it deliberately.
   *
   * The claim is released on unmount and the previous values are put back.
   */
  ownsDocument?: boolean
  /**
   * Where overlays in this subtree portal to.
   *
   * Unset, a Modal, Popover or Tooltip goes to the page's own layer at the end
   * of `document.body` (`overlayLayer`), over everything on the page. `'self'`
   * keeps them inside this provider's own wrapper instead, which is what a host
   * embedding a panel it did not write wants — the overlay is then contained,
   * themed by the wrapper, and goes away with it. Pass an element to name the
   * container yourself.
   *
   * Worth knowing before switching: an ancestor with `overflow: hidden` or a
   * `transform` will clip or trap a contained overlay, which the page's layer
   * never does.
   */
  portalContainer?: HTMLElement | 'self'
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * There is one document, so the claim on it is module-level. Whoever holds this
 * token owns `<html>`; everyone else leaves it alone.
 */
let documentOwner: object | null = null

/** Test seam: forget who owns the document. */
export function resetDocumentOwner(): void {
  documentOwner = null
}

const RTL_LANGS = new Set(['fa', 'ar', 'he', 'ur', 'ps'])

function isRtlLocale(locale: string): boolean {
  return RTL_LANGS.has(locale.split('-')[0] ?? '')
}

/**
 * The theming spine. Establishes token theme, text direction and locale for
 * everything inside it, and provides React Aria's i18n context so every
 * component gets correct RTL + locale behavior for free.
 *
 * The faces are the app's: Diba's tokens name them (`--db-font-family-fa`,
 * `--db-font-family-sans`), and the app loads the files and sets them, as
 * admin-web does with Yekan Bakh.
 *
 * This is intentionally the first thing built: theme/RTL/locale are the hardest
 * things to retrofit into a component library, so they're solved once, here.
 */
export function DibaProvider({
  theme = 'light',
  locale = 'fa-IR',
  dir,
  strings,
  ariaStrings = true,
  ownsDocument,
  portalContainer,
  className,
  style,
  children,
}: DibaProviderProps) {
  const direction: DibaDir = dir ?? (isRtlLocale(locale) ? 'rtl' : 'ltr')

  /**
   * React Aria ships no Persian, so the strings it writes itself — the
   * calendar's Previous/Next, a date segment's name, a table's sort
   * announcement — arrive in English on a Persian page. This hands it ours.
   *
   * During render rather than in an effect, because the dictionary is read
   * once by the first React Aria component to ask for it and cached for the
   * life of the page; an effect runs too late for anything in this tree.
   *
   * It is a global, single-locale registry — React Aria's design, not ours —
   * so an English subtree inside a Persian app would read these too. That is
   * the right trade for a Persian-first product and the wrong one for a
   * bilingual page, which is what `ariaStrings={false}` is for.
   */
  if (ariaStrings && locale.toLowerCase().startsWith('fa')) installPersianAriaStrings(locale)

  /**
   * Reflect theme, direction and locale onto `<html>` so portaled overlays —
   * which land on `document.body`, outside the wrapper below — match the tree
   * they came from.
   *
   * Claimed rather than simply written. The old version set these on every
   * mount with no cleanup and no check, which is correct only while exactly one
   * provider exists per document. Mount a second — a panel from another team,
   * an extension in the admin — and it silently re-themed the whole page,
   * flipped its direction, rewrote its `lang`, and left all of that behind when
   * it unmounted. First one in wins, and puts everything back on the way out.
   */
  const [selfHost, setSelfHost] = useState<HTMLElement | null>(null)
  const container =
    portalContainer === 'self' ? (selfHost ?? undefined) : (portalContainer ?? undefined)

  /*
   * Diba's own overlays read the container from PortalContext. The components
   * copied from upstream use React Aria's overlays directly, so React Aria is
   * told too; without it a contained page's select or modal still opened at
   * the end of <body>. Unset, the page's layer, where React Aria places an
   * overlay right on a right-to-left page that scrolls (overlayLayer says
   * why); none on the server, where there is no document.
   */
  const getContainer = useCallback(() => container ?? overlayLayer(), [container])

  const token = useRef<object>(undefined as unknown as object)
  token.current ??= {}

  useEffect(() => {
    if (ownsDocument === false) return
    const mine = token.current
    if (ownsDocument !== true && documentOwner !== null && documentOwner !== mine) return
    documentOwner = mine

    const html = document.documentElement
    const before = {
      dir: html.getAttribute('dir'),
      theme: html.getAttribute('data-theme'),
      lang: html.getAttribute('lang'),
    }

    html.setAttribute('dir', direction)
    html.setAttribute('data-theme', theme)
    html.setAttribute('lang', locale)

    return () => {
      const put = (name: string, value: string | null) =>
        value === null ? html.removeAttribute(name) : html.setAttribute(name, value)
      put('dir', before.dir)
      put('data-theme', before.theme)
      put('lang', before.lang)
      if (documentOwner === mine) documentOwner = null
    }
  }, [direction, theme, locale, ownsDocument])

  return (
    <I18nProvider locale={locale}>
      <StringsContext.Provider value={strings ?? null}>
        <PortalContext.Provider value={container}>
          <div
            data-theme={theme}
            dir={direction}
            lang={locale}
            className={cn('db-root', className)}
            style={style}
          >
            <UNSAFE_PortalProvider getContainer={getContainer}>{children}</UNSAFE_PortalProvider>
            {/*
              Last child, so a contained overlay stacks above the content it was
              opened from without needing a z-index to say so.
            */}
            {portalContainer === 'self' && <div className="db-portal" ref={setSelfHost} />}
          </div>
        </PortalContext.Provider>
      </StringsContext.Provider>
    </I18nProvider>
  )
}
