import Image from 'next/image'

/**
 * "Developed by BigApeWeb.com" credit with the ape mark.
 * tone: 'light' for light backgrounds, 'dark' for dark ones. Text colour
 * inherits from the parent so it fits any footer or theme.
 */
export default function DeveloperCredit({ tone = 'light', className = '' }) {
  return (
    <a
      href="https://bigapeweb.com"
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 ${className}`}
    >
      <span>Developed by</span>
      <Image
        src={tone === 'dark' ? '/brand/bigapeweb/ape-mark-on-dark.svg' : '/brand/bigapeweb/ape-mark.svg'}
        alt=""
        width={16}
        height={16}
        unoptimized
      />
      <span className="font-semibold">BigApeWeb.com</span>
    </a>
  )
}
