'use client'

import Image from 'next/image'
import { getImagePath } from '@/lib/media'

function isBangla(text) {
  return /[\u0980-\u09FF]/.test(text || '')
}

function TimelineMoment({ moment, index }) {
  const isEven = index % 2 === 0
  const titleBn = moment?.title?.bn || moment?.title?.ur || ''
  const storyBn = moment?.story?.bn || moment?.story?.ur || ''
  
  const titleIsBangla = isBangla(titleBn) || Boolean(moment?.title?.bn)
  const storyIsBangla = isBangla(storyBn) || Boolean(moment?.story?.bn)

  return (
    <div className={`flex flex-col-reverse md:grid md:grid-cols-12 gap-8 md:gap-16 mb-32 last:mb-0 ${isEven ? '' : 'md:flex-row-reverse'}`}>
      {/* Image Column */}
      <div className={`md:col-span-7 ${isEven ? '' : 'md:col-start-6'}`}>
        <div className="relative aspect-[4/6] overflow-hidden rounded-sm shadow-sm bg-warm-grey/20">
          {moment?.imagePath ? (
            <Image
              src={getImagePath(moment.imagePath)}
              alt={moment?.title?.en || 'Our Story'}
              fill
              quality={90}
              style={{ objectPosition: moment?.imagePosition || 'center' }}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-graphite/30 italic">
              ShubhoBiye Story
            </div>
          )}
        </div>
      </div>

      {/* Text Column */}
      <div className={`md:col-span-5 flex flex-col justify-center ${isEven ? '' : 'md:col-start-1 md:row-start-1'}`}>
        {moment?.year && (
          <p className="font-body text-sm text-clay uppercase tracking-widest font-medium mb-3">
            {moment.year}
          </p>
        )}

        {moment?.title?.en && (
          <h3 className="font-display text-3xl md:text-4xl text-graphite mb-4">
            {moment.title.en}
          </h3>
        )}

        {titleBn && (
          <p className={`${titleIsBangla ? 'font-bangla whitespace-pre-line' : 'font-arabic direction-rtl'} text-2xl text-graphite/80 mb-6`}>
            {titleBn}
          </p>
        )}

        <div className="w-12 h-[1px] bg-warm-grey mb-6" />

        {moment?.story?.en && (
          <p className="drop-cap font-body text-graphite/80 leading-relaxed mb-4">
            {moment.story.en}
          </p>
        )}

        {storyBn && (
          <p className={`${storyIsBangla ? 'font-bangla whitespace-pre-line text-lg' : 'font-arabic direction-rtl text-base'} text-graphite/60 leading-relaxed`}>
            {storyBn}
          </p>
        )}
      </div>
    </div>
  )
}

export default function StoryTimeline({ storyData: propData }) {
  const storyData = propData || { milestones: [] }
  if (!storyData || !storyData.milestones?.length) return null

  const headerTitleBn = storyData?.title?.bn || storyData?.title?.ur || ''
  const titleIsBangla = isBangla(headerTitleBn) || Boolean(storyData?.title?.bn)

  return (
    <section className="py-32 bg-bone transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center mb-24">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-graphite tracking-tight mb-4">
            {storyData.title?.en || 'Our Journey'}
          </h2>
          
          {headerTitleBn && (
            <p className={`${titleIsBangla ? 'font-bangla whitespace-pre-line' : 'font-arabic direction-rtl'} text-3xl text-graphite/70`}>
              {headerTitleBn}
            </p>
          )}

          <div className="h-[1px] w-16 bg-clay mx-auto mt-8" />
        </div>

        {/* Timeline */}
        <div className="max-w-6xl mx-auto">
          {storyData.milestones.map((moment, index) => (
            <TimelineMoment key={index} moment={moment} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
