import Reveal from '../primitives/Reveal'
import { Bilingual } from '../primitives/text'
import { Divider } from '@/themes/ornaments'

/** "With warm regards" and who sends the invitation. */
export default function Closing({ closing, signedBy, ornament }) {
  if (!closing?.en && !closing?.bn && !signedBy?.en && !signedBy?.bn) return null
  return (
    <section className="bg-t-bg px-5 pb-24 pt-8 text-center">
      <Reveal className="mx-auto max-w-xl">
        <Divider ornament={ornament} className="mb-10" />
        <Bilingual value={closing} className="space-y-1" enClassName="font-t-display text-xl italic" bnClassName="font-t-bn text-base text-t-ink-muted" />
        <Bilingual value={signedBy} className="mt-4 space-y-1" enClassName="text-lg" bnClassName="font-t-bn text-base text-t-ink-muted" />
      </Reveal>
    </section>
  )
}
