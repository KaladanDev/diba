import type { ComponentProps } from 'react'
import {
  ModalOverlay as AriaModalOverlay,
  Popover as AriaPopover,
  Tooltip as AriaTooltip,
} from 'react-aria-components'
import { usePortalContainer } from '../../provider/portal'

/**
 * React Aria's three portal roots, taught to respect a container.
 *
 * Eight components open an overlay — Dialog, Drawer, Popover, Menu, Select,
 * Autocomplete, DatePicker, Tooltip — and every one of them reaches one of
 * these three. Wiring `UNSTABLE_portalContainer` at each call site would mean
 * eight chances to forget, and the ninth component would be the one that
 * escapes its host with nothing to catch it. So it is wired once, here, and the
 * rule for a new overlay becomes "take the portal root from this file", which is
 * a rule a reviewer can actually check.
 *
 * The container comes from context rather than a prop because containment is a
 * decision the surrounding host makes. A call site that genuinely needs to
 * override can still pass the prop — it spreads after.
 */

/**
 * ModalOverlay, not Modal.
 *
 * The overlay is the element that portals; a Modal inside one never leaves the
 * tree. Wrapping Modal looked right, typechecked, and contained nothing —
 * Dialog and Drawer both render Modal inside an overlay, so the wrapper sat one
 * level too deep and did exactly nothing. The containment test is the only
 * reason that is not still true.
 */
export function ModalOverlay(props: ComponentProps<typeof AriaModalOverlay>) {
  return <AriaModalOverlay UNSTABLE_portalContainer={usePortalContainer()} {...props} />
}

export function Popover(props: ComponentProps<typeof AriaPopover>) {
  return <AriaPopover UNSTABLE_portalContainer={usePortalContainer()} {...props} />
}

export function Tooltip(props: ComponentProps<typeof AriaTooltip>) {
  return <AriaTooltip UNSTABLE_portalContainer={usePortalContainer()} {...props} />
}
