export function Card({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-2xl border border-sb-line bg-sb-card ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-sb-line px-5 py-4 sm:px-6 ${className}`}>
      <div className="min-w-0">
        <h2 className="font-display text-xl font-semibold text-sb-ink">{title}</h2>
        {description && <p className="mt-0.5 max-w-prose text-sm text-sb-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={`space-y-5 px-5 py-5 sm:px-6 ${className}`}>{children}</div>
}

const BADGE_TONES = {
  neutral: 'bg-sb-soft text-sb-muted',
  live: 'bg-[#E4F1E7] text-sb-sage',
  draft: 'bg-[#FBEFD6] text-[#8A5A08]',
  danger: 'bg-[#F6E3E4] text-sb-alta',
  accent: 'bg-[#FCEBD9] text-sb-marigold-deep',
}

export function Badge({ tone = 'neutral', className = '', children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONES[tone]} ${className}`}>{children}</span>
}

export const STATUS_BADGE = {
  live: { tone: 'live', label: 'Live' },
  draft: { tone: 'draft', label: 'Draft' },
  expired: { tone: 'danger', label: 'Expired' },
  archived: { tone: 'neutral', label: 'In trash' },
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-sb-line-strong bg-sb-card/60 p-8 text-center">
      <p className="font-medium text-sb-ink">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-sb-muted">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
