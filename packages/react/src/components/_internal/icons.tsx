/** Internal inline icons (currentColor). A public Icon primitive comes later. */
interface IconProps {
  className?: string
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={className}>
      <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.1l-4.95 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Box-with-arrow, the conventional "opens in a new tab" mark. */
export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M6.5 3.5H3.5v9h9v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 3.5h3v3M12.5 3.5L7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Points left (‹) at rest. Flip with `-scale-x-100` / `rtl:` variants for direction. */
export function ChevronIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M10 3l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/*
 * Status marks. Filled discs rather than outlines, because these are read at a
 * glance from the corner of the screen — and deliberately three *different
 * shapes* inside the disc, so a toast still says which kind of news it is when
 * the colour is lost to a greyscale print or to the roughly one man in twelve
 * who cannot separate the green from the red.
 */

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path
        d="M6.5 10.2l2.3 2.3 4.7-5"
        stroke="var(--db-surface)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** An exclamation — used for both danger and warning, which differ by colour. */
export function AlertCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path d="M10 5.75v5" stroke="var(--db-surface)" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="1.05" fill="var(--db-surface)" />
    </svg>
  )
}

export function InfoCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="10" r="8" fill="currentColor" />
      <path d="M10 9.25v5" stroke="var(--db-surface)" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="10" cy="6.1" r="1.05" fill="var(--db-surface)" />
    </svg>
  )
}

/** Two sheets, one behind the other — the copy mark everyone already knows. */
export function CopyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <rect
        x="5.75"
        y="5.75"
        width="8.5"
        height="8.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10.25 3.75A2 2 0 0 0 8.25 1.75h-4.5a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A page with a bound top edge — the calendar mark. */
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect
        x="2.75"
        y="4.25"
        width="14.5"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2.75 8.25h14.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.75 2.75v3M13.25 2.75v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
