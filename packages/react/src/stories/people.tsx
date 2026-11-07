import type { ReactNode } from 'react'
import { Avatar } from '../components/avatar'
import { hueOf, initials } from '../sdui/blocks/common'

/**
 * The people and shops the avatar stories draw: a name in each language and an illustrated
 * portrait, made here as SVG so nothing is fetched. Nothing here ships in the package.
 */

const svg = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">${body}</svg>`,
  )}`

/** A flat portrait: shoulders, a neck, a face, and hair or a scarf. */
function portrait({
  bg,
  skin,
  top,
  shirt,
  scarf = false,
}: {
  bg: string
  skin: string
  top: string
  shirt: string
  scarf?: boolean
}) {
  const shoulders = `<path d="M12 96c3-21 17-31 36-31s33 10 36 31z" fill="${shirt}"/>`
  const neck = `<rect x="41" y="50" width="14" height="18" rx="6" fill="${skin}"/>`
  if (scarf)
    return svg(
      `<rect width="96" height="96" fill="${bg}"/>${shoulders}` +
        `<path d="M25 46c0-17 10-28 23-28s23 11 23 28v12c0 9-11 15-23 15S25 67 25 58z" fill="${top}"/>` +
        `<ellipse cx="48" cy="45" rx="14" ry="16" fill="${skin}"/>`,
    )
  return svg(
    `<rect width="96" height="96" fill="${bg}"/>${shoulders}${neck}` +
      `<circle cx="48" cy="40" r="17" fill="${skin}"/>` +
      `<path d="M30 40c0-13 8-21 18-21s18 8 18 21c-3-7-9-10-18-10s-15 3-18 10z" fill="${top}"/>`,
  )
}

export type Person = { fa: string; en: string; photo?: string }

/** Eight people, four with a portrait. */
export const people: Person[] = [
  {
    fa: 'نیلوفر رستمی',
    en: 'Niloufar Rostami',
    photo: portrait({
      bg: '#e8d9c4',
      skin: '#e0b48f',
      top: '#5b3a6b',
      shirt: '#2f4858',
      scarf: true,
    }),
  },
  {
    fa: 'آرش کریمی',
    en: 'Arash Karimi',
    photo: portrait({ bg: '#cfe0e8', skin: '#c99a76', top: '#2b211c', shirt: '#7a4b2a' }),
  },
  { fa: 'سارا احمدی', en: 'Sara Ahmadi' },
  {
    fa: 'مهدی توکلی',
    en: 'Mahdi Tavakoli',
    photo: portrait({ bg: '#dfe6d0', skin: '#a8754f', top: '#3b3b3b', shirt: '#46607a' }),
  },
  { fa: 'لیلا صادقی', en: 'Leila Sadeghi' },
  {
    fa: 'پریسا نوری',
    en: 'Parisa Nouri',
    photo: portrait({
      bg: '#f0d6d2',
      skin: '#f1c7a5',
      top: '#1f5f5b',
      shirt: '#b5523b',
      scarf: true,
    }),
  },
  { fa: 'کاوه مرادی', en: 'Kaveh Moradi' },
  { fa: 'رضا جعفری', en: 'Reza Jafari' },
]

/** Two shops' marks, for an avatar that is a business. */
export const shops = {
  tea: {
    fa: 'چای‌خانهٔ آفتاب',
    en: 'Aftab Tea House',
    photo: svg(
      '<rect width="96" height="96" fill="#c9821f"/>' +
        '<path d="M28 42h34v14c0 10-8 17-17 17s-17-7-17-17z" fill="#fff8ec"/>' +
        '<path d="M62 46h4a7 7 0 0 1 0 14h-5" fill="none" stroke="#fff8ec" stroke-width="4"/>' +
        '<path d="M38 26c-3 4 3 6 0 10M47 24c-3 4 3 6 0 10M56 26c-3 4 3 6 0 10" fill="none" stroke="#fff8ec" stroke-width="3" stroke-linecap="round"/>',
    ),
  },
  scarf: {
    fa: 'ترمه‌سرای یزد',
    en: 'Yazd Termeh House',
    photo: svg(
      '<rect width="96" height="96" fill="#2f4a6b"/>' +
        '<path d="M48 20c10 12 20 18 20 30a20 20 0 0 1-40 0c0-12 10-18 20-30z" fill="#e7c873"/>' +
        '<path d="M48 36c5 6 9 9 9 15a9 9 0 0 1-18 0c0-6 4-9 9-15z" fill="#2f4a6b"/>',
    ),
  },
}

/** Products' pictures, for what a badge sits on in a shop. */
export const goods = {
  scarf: {
    fa: 'شال ابریشم',
    en: 'Silk scarf',
    photo: svg(
      '<rect width="96" height="96" fill="#efe6d8"/>' +
        '<path d="M22 30c10-6 42-6 52 0l-6 40c-8 5-32 5-40 0z" fill="#8c2f39"/>' +
        '<path d="M28 38c9-4 31-4 40 0M29 48c9-4 29-4 38 0M30 58c9-4 27-4 36 0" fill="none" stroke="#e7c873" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M40 70l-4 14M48 71v14M56 70l4 14" stroke="#8c2f39" stroke-width="3" stroke-linecap="round"/>',
    ),
  },
  tea: {
    fa: 'چای لاهیجان',
    en: 'Lahijan tea',
    photo: svg(
      '<rect width="96" height="96" fill="#dfe9dc"/>' +
        '<rect x="30" y="24" width="36" height="52" rx="6" fill="#2f5d46"/>' +
        '<rect x="30" y="38" width="36" height="16" fill="#e7c873"/>' +
        '<path d="M44 46c0-4 8-4 8 0s-8 4-8 0z" fill="#2f5d46"/>',
    ),
  },
}

/** A photo that will not load: what a broken link draws. */
export const brokenPhoto = 'data:image/png;base64,AAAA'

export type Presence = 'online' | 'away' | 'busy' | 'offline'

/** A presence in the reader's language, as the block says it. */
export const presenceWord = (presence: Presence, persian: boolean) =>
  (
    ({
      online: ['آنلاین', 'Online'],
      away: ['غایب', 'Away'],
      busy: ['مشغول', 'Busy'],
      offline: ['آفلاین', 'Offline'],
    }) as const
  )[presence][persian ? 0 : 1]

type Size = 'sm' | 'md' | 'lg'
type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'

/**
 * An avatar as the block draws one: a photo over the initials, the name's hue when neither it nor
 * its group has a colour, named for a screen reader with its presence after the name, and a dot
 * and a ring when asked for. [persian] picks the name and the words. A function returning the
 * Avatar element itself, not a component around one, so an AvatarGroup can size and count it.
 */
export function face({
  person,
  persian,
  photo,
  icon,
  size,
  color,
  groupColor,
  variant,
  presence,
  ringed,
  delayMs,
  hidden,
  key,
}: {
  person: Person
  persian: boolean
  /** The person's own when left out; null for none. */
  photo?: string | null
  icon?: ReactNode
  size?: Size
  color?: Color
  /** The colour its group gives the avatars that have none. */
  groupColor?: Color
  variant?: 'default' | 'soft'
  presence?: Presence
  ringed?: boolean
  delayMs?: number
  /** Beside the name in words, it says nothing itself. */
  hidden?: boolean
  key?: string
}) {
  const name = persian ? person.fa : person.en
  const src = photo === undefined ? person.photo : (photo ?? undefined)
  const label = [name, presence ? presenceWord(presence, persian) : '']
    .filter(Boolean)
    .join(persian ? '، ' : ', ')
  return (
    <Avatar
      key={key}
      size={size}
      color={color}
      variant={variant}
      data-hue={(color ?? groupColor) === undefined && !icon ? hueOf(name) : undefined}
      data-ringed={ringed ? true : undefined}
      role={hidden ? undefined : 'img'}
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden ? true : undefined}
    >
      {src ? <Avatar.Image src={src} alt="" /> : null}
      <Avatar.Fallback aria-hidden delayMs={delayMs}>
        {icon ?? initials(name)}
      </Avatar.Fallback>
      {presence ? <span className="avatar__presence" data-presence={presence} /> : null}
    </Avatar>
  )
}
