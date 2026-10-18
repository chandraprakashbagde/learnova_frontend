import { ImageOff } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/common/lib/utils'

export interface SmartImageSource {
  /** MIME type, e.g. `image/avif`. */
  type: string
  src: string
}

export interface SmartImageProps {
  /** Fallback raster source (JPEG/PNG) used when no modern source applies. */
  src: string
  alt: string
  /** Modern format variants rendered through <picture>, e.g. AVIF. */
  sources?: SmartImageSource[]
  /** Tailwind aspect utility written literally, e.g. `aspect-[16/9]`. Reserves space so images never cause layout shifts. */
  aspectClassName?: string
  /** Extra classes for the outer box (rounding, borders, …). */
  className?: string
  /** Extra classes for the <img> (object position, hover zoom, …). */
  imgClassName?: string
  /** Above-the-fold images should load eagerly. */
  eager?: boolean
}

/**
 * Image with reserved aspect-ratio space, optional modern formats and a
 * graceful branded fallback when the file fails to load.
 */
export function SmartImage({
  src,
  alt,
  sources,
  aspectClassName = 'aspect-[4/3]',
  className,
  imgClassName,
  eager = false,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-muted', aspectClassName, className)}>
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 grid place-items-center bg-dots bg-background gradient-cta opacity-95"
        >
          <span className="flex flex-col items-center gap-1.5 px-4 text-center text-primary-foreground/90">
            <ImageOff aria-hidden="true" className="size-6" />
            <span className="text-[11px] font-medium leading-snug">{alt}</span>
          </span>
        </div>
      ) : (
        <picture className="absolute inset-0 block size-full">
          {sources?.map((source) => (
            <source key={source.type} srcSet={source.src} type={source.type} />
          ))}
          <img
            src={src}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={cn('size-full object-cover', imgClassName)}
            onError={() => setFailed(true)}
          />
        </picture>
      )}
    </div>
  )
}