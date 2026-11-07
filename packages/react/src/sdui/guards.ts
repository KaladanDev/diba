/**
 * What a tree from somewhere else is not allowed to do.
 *
 * Everything here assumes the payload is hostile, because the whole point of
 * the SDUI tier is that it renders trees the host did not write. None of it is
 * a substitute for validating against the generated JSON Schema first — these
 * are the checks a schema cannot express. The Flutter renderer's
 * `guards.dart` is the same rules in the same order.
 */

/** Schemes a URL from a tree may use. Everything else is refused. */
const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

/**
 * `javascript:` in an href is the oldest trick there is, and React will happily
 * render it — it warns in development and still puts it in the DOM. `data:` is
 * the same hole wearing a hat, since `data:text/html` carries a whole document;
 * images are the one form of it worth allowing.
 */
export function isSafeUrl(value: string): boolean {
  const trimmed = value.trim()
  // Relative paths and fragments never carry a scheme, and are the common case.
  if (/^[./#?]/.test(trimmed) || trimmed === '') return true
  if (/^data:image\/(png|jpeg|gif|webp|svg\+xml);/i.test(trimmed)) return true
  try {
    return SAFE_SCHEMES.has(new URL(trimmed, 'https://diba.invalid').protocol)
  } catch {
    return false
  }
}

/**
 * The one rule for every image prop: http(s), relative, or `data:image`.
 * Narrower than [isSafeUrl], since a picture has no business being `mailto:`.
 */
export function isSafeImageUrl(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === '' || !isSafeUrl(trimmed)) return false
  if (/^[./#?]/.test(trimmed)) return true
  try {
    return ['http:', 'https:', 'data:'].includes(new URL(trimmed, 'https://diba.invalid').protocol)
  } catch {
    return false
  }
}

/*
 * There is no by-value guard any more. It refused any string that began with a
 * word and a colon — "Warning: stock is low", "Re: your order", `sku:123` — in
 * any prop. URLs are guarded by prop instead: the manifest gives each URL prop
 * a format, and the surface holds those props, and only those, to [isSafeUrl]
 * or [isSafeImageUrl].
 */

export interface TreeLimits {
  /** How deeply nodes may nest. */
  depth: number
  /** How many nodes the whole tree may contain. */
  nodes: number
}

/**
 * Not a security boundary so much as a courtesy one. A tree two thousand levels
 * deep or with a hundred thousand nodes does not breach anything — it just
 * takes the tab down, which from the merchant's side is indistinguishable from
 * the admin being broken.
 */
export const DEFAULT_LIMITS: TreeLimits = { depth: 32, nodes: 500 }

export function checkTree(
  node: unknown,
  limits: TreeLimits = DEFAULT_LIMITS,
): { ok: true } | { ok: false; reason: string } {
  let count = 0

  const walk = (n: unknown, depth: number): string | null => {
    if (n === null || typeof n !== 'object') return null
    if (depth > limits.depth) return `tree deeper than ${limits.depth} levels`
    if (++count > limits.nodes) return `tree larger than ${limits.nodes} nodes`

    const children = (n as { children?: unknown }).children
    if (Array.isArray(children)) {
      for (const child of children) {
        const bad = walk(child, depth + 1)
        if (bad) return bad
      }
    }
    // Slots are nodes too. Counting only children let a tree hide any amount
    // of work in a trigger or a footer, and the schema leans on slots for every
    // overlay.
    const slots = (n as { slots?: unknown }).slots
    if (slots !== null && typeof slots === 'object') {
      for (const slot of Object.values(slots)) {
        const bad = walk(slot, depth + 1)
        if (bad) return bad
      }
    }
    return null
  }

  const reason = walk(node, 1)
  return reason ? { ok: false, reason } : { ok: true }
}
