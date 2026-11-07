import { useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { useDibaStrings } from '../../i18n/strings'
import { Modal } from '../modal'
import { Skeleton } from '../skeleton'

const image = tv({
  base: 'db-image',
  variants: {
    fit: { cover: '', contain: 'db-image--contain' },
    /** The block's radii, on both platforms: 0, 8, 12, 16 or round. */
    radius: {
      none: 'db-image--radius-none',
      sm: 'db-image--radius-sm',
      md: 'db-image--radius-md',
      lg: 'db-image--radius-lg',
      full: 'db-image--radius-full',
    },
  },
  defaultVariants: { fit: 'cover', radius: 'md' },
})

export type ImageFit = NonNullable<VariantProps<typeof image>['fit']>
export type ImageRadius = NonNullable<VariantProps<typeof image>['radius']>

export const imageOptions = {
  fit: ['cover', 'contain'] as ImageFit[],
  radius: ['none', 'sm', 'md', 'lg', 'full'] as ImageRadius[],
}

export interface ImageProps {
  src?: string
  /**
   * What the picture shows. Empty string for a picture that adds nothing the
   * surrounding text does not already say — which is most product thumbnails
   * beside their own title.
   */
  alt: string
  /**
   * The shape of the box, as a CSS aspect ratio. The prop this component is
   * really about: a height only known after loading is the largest single
   * cause of a page jumping under someone's thumb. `'auto'` takes the
   * picture's own shape once it has come.
   * @default '1 / 1'
   */
  ratio?: string | number
  /** @default 'cover' */
  fit?: ImageFit
  /** Its corners: 0, 8, 12, 16 or round. @default 'md' */
  radius?: ImageRadius
  /** A press opens the picture larger, over the page, as Flutter's does. */
  isZoomable?: boolean
  /** Shown if the picture never arrives. Defaults to its `alt`. */
  fallback?: ReactNode
  /** Native loading hint. @default 'lazy' */
  loading?: 'lazy' | 'eager'
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLDivElement>
}

/**
 * A picture that holds its place before it exists.
 *
 * Avatar's idea at page scale: the box is sized from `ratio`, a skeleton sits
 * underneath, and the picture fades in over it. Nothing is swapped in, so a
 * slow image never leaves a hole in the layout and a broken one never leaves a
 * torn glyph — the failure state is a mark that says something was meant to be
 * here without pretending to be it.
 */
export function Image({
  src,
  alt,
  ratio = '1 / 1',
  fit,
  radius,
  isZoomable,
  fallback,
  loading = 'lazy',
  className,
  style,
  ref,
}: ImageProps) {
  const t = useDibaStrings()
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const auto = ratio === 'auto'

  const box = (
    <div
      ref={ref}
      data-slot="image"
      data-state={state}
      data-ratio={auto ? 'auto' : undefined}
      className={image({ fit, radius, className })}
      style={{ aspectRatio: ratio, ...style }}
    >
      {src ? (
        <img
          className="db-image__img"
          src={src}
          alt={alt}
          loading={loading}
          data-loaded={state === 'loaded' || undefined}
          onLoad={() => setState('loaded')}
          onError={() => setState('failed')}
        />
      ) : null}

      {state === 'loading' && src ? (
        <Skeleton className="db-image__placeholder" style={{ width: '100%', height: '100%' }} />
      ) : null}

      {state === 'failed' || !src ? (
        // A picture that failed is still named by its `alt`, so its words here are not said a
        // second time; with no `src` at all, they are what is said.
        <div className="db-image__fallback" aria-hidden={src || !alt ? true : undefined}>
          {fallback ?? alt}
        </div>
      ) : null}
    </div>
  )

  if (!isZoomable || !src || state === 'failed') return box

  return (
    <Modal>
      <Modal.Trigger className="db-image__zoom" aria-label={t.enlarge(alt)}>
        {box}
      </Modal.Trigger>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog aria-label={alt || t.enlarge('')}>
            <Modal.CloseTrigger />
            <Modal.Body>
              <img className="db-image__enlarged" src={src} alt={alt} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
