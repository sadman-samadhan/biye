'use client'

import { useId } from 'react'

const control =
  'w-full rounded-lg border border-sb-line-strong bg-sb-card px-3.5 py-2.5 text-[15px] text-sb-ink placeholder:text-sb-muted/60 outline-none transition focus:border-sb-marigold focus:ring-2 focus:ring-sb-holud/30 disabled:bg-sb-soft disabled:text-sb-muted aria-[invalid=true]:border-sb-alta'

export function Field({ label, hint, error, htmlFor, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-sb-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-sb-alta">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-sb-muted">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ label, hint, error, className = '', id, lang, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
      <input id={inputId} lang={lang} aria-invalid={Boolean(error)} className={`${control} ${lang === 'bn' ? 'font-bangla-body' : ''}`} {...props} />
    </Field>
  )
}

export function TextArea({ label, hint, error, className = '', id, rows = 3, lang, ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
      <textarea id={inputId} rows={rows} lang={lang} aria-invalid={Boolean(error)} className={`${control} resize-y leading-relaxed ${lang === 'bn' ? 'font-bangla-body' : ''}`} {...props} />
    </Field>
  )
}

export function Select({ label, hint, error, className = '', id, options = [], ...props }) {
  const autoId = useId()
  const inputId = id || autoId
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} className={className}>
      <select id={inputId} aria-invalid={Boolean(error)} className={`${control} pr-8`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function Switch({ label, description, checked, onChange, disabled, id }) {
  const autoId = useId()
  const switchId = id || autoId
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={switchId} className="block text-sm font-medium text-sb-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-sb-muted">{description}</p>}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sb-marigold disabled:opacity-50 ${
          checked ? 'bg-sb-marigold' : 'bg-sb-line-strong'
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

/** English + Bangla pair for one bilingual value: { en, bn }. */
export function BilingualField({ label, hint, value, onChange, multiline = false, rows = 3, placeholder = {}, maxLength }) {
  const v = value || {}
  const Control = multiline ? TextArea : TextInput
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium text-sb-ink">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <Control
          aria-label={`${label} (English)`}
          value={v.en || ''}
          placeholder={placeholder.en || 'English'}
          rows={rows}
          maxLength={maxLength}
          onChange={(e) => onChange({ ...v, en: e.target.value })}
        />
        <Control
          aria-label={`${label} (বাংলা)`}
          lang="bn"
          value={v.bn || ''}
          placeholder={placeholder.bn || 'বাংলা'}
          rows={rows}
          maxLength={maxLength}
          onChange={(e) => onChange({ ...v, bn: e.target.value })}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-sb-muted">{hint}</p>}
    </fieldset>
  )
}
