import Reveal from '../primitives/Reveal'
import { Bilingual } from '../primitives/text'
import { KhatamStar } from '@/themes/ornaments'

const has = (v) => typeof v === 'string' && v.trim()

function Host({ host, copy }) {
  const relation = copy[host.relation === 'son' ? 'invite.son' : 'invite.daughter']
  return (
    <div className="flex-1 text-center">
      {has(host.child?.en) && <p className="t-display text-3xl md:text-4xl">{host.child.en}</p>}
      {has(host.child?.bn) && (
        <p lang="bn" className="mt-1 font-t-bn-display text-xl text-t-accent-strong">
          {host.child.bn}
        </p>
      )}
      {(has(host.parents?.en) || has(host.parents?.bn)) && (
        <div className="mt-4 space-y-1">
          {has(host.parents?.en) && (
            <p>
              <span className="block text-[11px] uppercase tracking-[0.3em] text-t-accent">{relation.en}</span>
              <span className="mt-1 block text-lg">{host.parents.en}</span>
            </p>
          )}
          {/* Bangla puts the relation after the parents: "… -এর কন্যা" */}
          {has(host.parents?.bn) && (
            <p lang="bn" className="font-t-bn text-base text-t-ink-muted">
              {host.parents.bn}-এর {relation.bn}
            </p>
          )}
        </div>
      )}
      <Bilingual value={host.address} className="mt-3 space-y-0.5 text-sm text-t-ink-muted" bnClassName="font-t-bn" />
    </div>
  )
}

/** "Daughter of … / Son of …" for both families. */
export default function Hosts({ variant, hosts = [], copy }) {
  const shown = hosts.filter((h) => has(h.child?.en) || has(h.child?.bn) || has(h.parents?.en) || has(h.parents?.bn))
  if (!shown.length) return null
  const arch = variant === 'arch' || variant === 'light'
  return (
    <section id="families" className="bg-t-bg-alt px-5 py-20 md:py-28">
      <Reveal className="mx-auto max-w-4xl">
        <Bilingual value={copy['invite.hosts.title']} as="h2" className="mb-12 text-center" enClassName="text-[11px] uppercase tracking-[0.4em] text-t-ink-muted" bnClassName="mt-1 text-sm text-t-ink-muted" />
        <div className={`flex flex-col items-center gap-10 md:flex-row md:items-start ${arch ? 'md:gap-6' : 'md:gap-12'}`}>
          <Host host={shown[0]} copy={copy} />
          {shown[1] && (
            <>
              <span className="text-t-ornament md:mt-4" aria-hidden="true">
                {arch ? <KhatamStar size={30} /> : <span className="t-display text-4xl text-t-accent">&amp;</span>}
              </span>
              <Host host={shown[1]} copy={copy} />
            </>
          )}
        </div>
      </Reveal>
    </section>
  )
}
