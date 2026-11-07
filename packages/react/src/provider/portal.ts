import { createContext, useContext } from 'react'

/**
 * Where overlays land.
 *
 * React Aria portals a Modal, Popover or Tooltip to `document.body` by default,
 * which is the right answer for an application that owns its page and the wrong
 * one everywhere else. Inside a host — an admin rendering a panel it did not
 * write — an overlay on `document.body` is an overlay over the host's own
 * chrome, at whatever z-index it happens to carry, with no way for the host to
 * contain or dismiss it.
 *
 * `undefined` is the page's own layer, [overlayLayer], at the end of
 * `document.body`. A `DibaProvider` given a `portalContainer` puts every
 * overlay in its subtree there instead.
 */
export const PortalContext = createContext<HTMLElement | undefined>(undefined)

let layer: HTMLElement | null = null

/**
 * Where overlays land unless a provider names a container: one layer for the
 * page, the last thing in `document.body`, laid at the page's top and as wide
 * as it, with no height of its own. Its style is its own, so it holds under
 * either of the package's stylesheets.
 *
 * React Aria's default was the body itself, and React Aria places an overlay
 * against the page when the body is unpositioned: it reckons from the page's
 * corner. On a right-to-left page tall enough to scroll, Chrome puts the
 * scrollbar on the left and the page starts that scrollbar's width in, which
 * React Aria does not count (`documentElement.clientLeft` is 0 there), so
 * every overlay sat 15px to the right of what opened it, on Windows (an
 * icon-only button's tooltip showed it). Positioning the body
 * itself fixed that and broke worse: React Aria takes a body's height to be
 * the window's, and a tooltip it hangs above its trigger by its bottom edge
 * fell below the trigger on any page taller than the window. Against this
 * layer, an ordinary positioned element, React Aria measures both right.
 */
export function overlayLayer(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (layer?.isConnected) return layer
  layer = document.createElement('div')
  layer.setAttribute('data-diba-overlays', '')
  layer.style.position = 'absolute'
  layer.style.top = '0'
  layer.style.left = '0'
  layer.style.right = '0'
  document.body.append(layer)
  return layer
}

/**
 * The element overlays in this subtree should portal into, or `undefined` for
 * the page's layer.
 *
 * Every component that opens one — Dialog, Drawer, Popover, Menu, Select,
 * Autocomplete, DatePicker, Tooltip — reads this and hands it to React Aria as
 * `UNSTABLE_portalContainer`. The name is theirs, and the reason it is only
 * wired in one place per component rather than exposed as a prop: containment
 * is a decision the surrounding host makes, not the call site.
 */
export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContext)
}
