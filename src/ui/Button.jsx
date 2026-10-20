import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-sb-ink text-sb-paper hover:bg-sb-ink-soft',
  accent: 'bg-sb-marigold text-white hover:bg-sb-marigold-deep',
  secondary: 'border border-sb-line-strong bg-sb-card text-sb-ink hover:bg-sb-soft',
  ghost: 'text-sb-ink hover:bg-sb-soft',
  danger: 'border border-sb-alta/30 bg-sb-card text-sb-alta hover:bg-sb-alta hover:text-white',
}

const SIZES = {
  sm: 'h-8 gap-1.5 rounded-md px-3 text-xs',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-12 gap-2 rounded-lg px-5 text-[15px]',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon: Icon,
  href,
  className = '',
  children,
  disabled,
  ...props
}) {
  const classes = `inline-flex shrink-0 items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-marigold disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const content = (
    <>
      {loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 16} /> : Icon ? <Icon size={size === 'sm' ? 14 : 16} /> : null}
      {children}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
