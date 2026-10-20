'use client'


function DuaCard({ dua }) {
  if (!dua) return null
  const scripturalText = dua.arabic || dua.sanskrit || ''
  const isSanskrit = Boolean(dua.sanskrit)
  const bengaliText = dua.bengali || dua.translationBn || ''
  const refBn = dua.reference?.bn || dua.reference?.ur || ''

  return (
    <div className="mb-20 last:mb-0">
      {/* Scriptural Text (Arabic / Sanskrit) */}
      {scripturalText && (
        <div className="mb-8">
          <blockquote className={`fancy-quote hanging-quote ${isSanskrit ? 'font-serif text-center' : 'font-arabic direction-rtl text-right'} text-2xl md:text-3xl text-graphite leading-relaxed mb-6`}>
            {scripturalText}
          </blockquote>
        </div>
      )}

      <div className="w-20 h-[1px] bg-clay mb-6" />

      {/* English Translation */}
      {(dua.translation || dua.english) && (
        <p className="font-body text-lg md:text-xl text-graphite/80 leading-relaxed mb-4">
          {dua.translation || dua.english}
        </p>
      )}

      {/* Bangla Translation */}
      {bengaliText && (
        <p className="font-bangla text-base md:text-lg text-graphite/70 leading-relaxed mb-4">
          {bengaliText}
        </p>
      )}

      {/* Reference */}
      {(dua.reference?.en || refBn) && (
        <div>
          {dua.reference?.en && (
            <p className="font-body text-sm text-clay uppercase tracking-wide">
              {dua.reference.en}
            </p>
          )}
          {refBn && (
            <p className={`${dua.reference?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-sm text-clay/70 mt-1`}>
              {refBn}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function DuasSection({ duasData: propData }) {
  // Support either full duasData object or array of duas
  const rawDuas = Array.isArray(propData) 
    ? propData 
    : (propData?.duas || [])
    
  const parentBlessings = propData?.parentBlessings || {}

  if (!rawDuas?.length && !parentBlessings?.message?.en) {
    return null
  }

  const parentTitleBn = parentBlessings?.title?.bn || parentBlessings?.title?.ur || ''
  const parentMsgBn = parentBlessings?.message?.bn || parentBlessings?.message?.ur || ''
  const parentAttrBn = parentBlessings?.attribution?.bn || parentBlessings?.attribution?.ur || ''

  return (
    <section className="py-32 bg-bone transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-graphite tracking-tight mb-4">
            Blessings & Prayers
          </h2>
          <p className="font-bangla text-2xl md:text-3xl text-graphite/70 mb-8">
            দোয়া ও শুভাশীর্বাদ
          </p>

          <div className="h-[1px] w-16 bg-clay mx-auto mb-8" />

          <p className="font-body text-base text-graphite/70 leading-relaxed max-w-2xl mx-auto">
            Surrounding this holy union with prayers of love, tranquility, and lifelong harmony
          </p>
        </div>

        {/* Duas List */}
        {rawDuas && rawDuas.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {rawDuas.map((dua, index) => (
              <DuaCard key={dua.id || index} dua={dua} />
            ))}
          </div>
        )}

        {/* Parent Blessings */}
        {parentBlessings && (parentBlessings.message?.en || parentMsgBn) && (
          <div className="mt-32 max-w-3xl mx-auto text-center">
            {parentBlessings.title?.en && (
              <h3 className="font-display text-3xl md:text-4xl text-graphite mb-4">
                {parentBlessings.title.en}
              </h3>
            )}
            {parentTitleBn && (
              <p className={`${parentBlessings?.title?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-2xl text-graphite/70 mb-8`}>
                {parentTitleBn}
              </p>
            )}

            {parentBlessings.message?.en && (
              <blockquote className="font-body text-lg md:text-xl text-graphite/80 italic leading-relaxed mb-6">
                &ldquo;{parentBlessings.message.en}&rdquo;
              </blockquote>
            )}

            {parentMsgBn && (
              <p className={`${parentBlessings?.message?.bn ? 'font-bangla' : 'font-arabic direction-rtl'} text-base md:text-lg text-graphite/70 italic leading-relaxed mb-6`}>
                &ldquo;{parentMsgBn}&rdquo;
              </p>
            )}
            
            {parentBlessings.attribution?.en && (
              <p className="font-body text-sm text-clay uppercase tracking-wide">
                {parentBlessings.attribution.en}
              </p>
            )}
            {parentAttrBn && (
              <p className={`${parentBlessings?.attribution?.bn ? 'font-bangla' : 'font-arabic'} text-sm text-clay/70 mt-1`}>
                {parentAttrBn}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
