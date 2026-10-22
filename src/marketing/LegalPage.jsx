import Shell from './Shell'

/** A plain-language legal page: title, date and sections of paragraphs or bullet lists. */
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <Shell locale="en">
      <main className="px-5 py-14 md:py-20">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-5xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-sb-muted">Last updated {updated}</p>
          <p className="mt-6 text-lg leading-relaxed text-sb-ink-soft">{intro}</p>
          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
                {section.body?.map((p) => (
                  <p key={p} className="mt-3 leading-relaxed text-sb-ink-soft">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-sb-ink-soft">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>
    </Shell>
  )
}
