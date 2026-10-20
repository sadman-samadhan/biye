/**
 * Every piece of fixed wording on a wedding site, in English and Bangla.
 * Traditions override the keys whose wording depends on faith (e.g. "Duas"
 * vs "Blessings"); a site can override any key later.
 */
export const BASE_COPY = {
  'hero.scroll': { en: 'Scroll to explore', bn: 'নিচে দেখুন' },
  'nav.home': { en: 'Home', bn: 'শুরু' },
  'nav.story': { en: 'Our Story', bn: 'আমাদের গল্প' },
  'nav.gallery': { en: 'Gallery', bn: 'ছবি' },
  'nav.blessings': { en: 'Blessings', bn: 'আশীর্বাদ' },
  'nav.guestbook': { en: 'Guestbook', bn: 'শুভেচ্ছা' },
  'story.title': { en: 'Our Journey', bn: 'আমাদের পথচলা' },
  'story.eyebrow': { en: 'How it began', bn: 'যেভাবে শুরু' },
  'spotlight.eyebrow': { en: 'A New Beginning', bn: 'নতুন পথচলা' },
  'monogram.topLabel': { en: 'Together with their families', bn: 'দুই পরিবারের আশীর্বাদে' },
  'ceremonies.when': { en: 'When', bn: 'কবে' },
  'ceremonies.where': { en: 'Where', bn: 'কোথায়' },
  'ceremonies.map': { en: 'Open in Maps', bn: 'ম্যাপে দেখুন' },
  'ceremonies.moments': { en: 'Moments & Memories', bn: 'মুহূর্ত ও স্মৃতি' },
  'ceremonies.photos': { en: 'Photos', bn: 'ছবি' },
  'gallery.title': { en: 'Captured Moments', bn: 'স্মৃতিময় মুহূর্তসমূহ' },
  'gallery.all': { en: 'All', bn: 'সব' },
  'gallery.more': { en: 'Show more', bn: 'আরও দেখুন' },
  'gallery.sharedWith': { en: 'Shared with', bn: 'যাঁর জন্য' },
  'blessings.title': { en: 'Blessings', bn: 'আশীর্বাদ' },
  'blessings.intro': { en: 'Words we carry into our life together', bn: 'আমাদের নতুন জীবনের পাথেয়' },
  'guestbook.title': { en: 'Leave Your Blessings', bn: 'আপনার শুভকামনা জানান' },
  'guestbook.name': { en: 'Your name', bn: 'আপনার নাম' },
  'guestbook.message': { en: 'Your message', bn: 'আপনার বার্তা' },
  'guestbook.optionalBn': { en: 'In Bangla (optional)', bn: 'বাংলায় (ঐচ্ছিক)' },
  'guestbook.send': { en: 'Send', bn: 'পাঠান' },
  'guestbook.thanks': { en: 'Thank you! Your message has been received.', bn: 'ধন্যবাদ! আপনার শুভেচ্ছা পৌঁছেছে।' },
  'guestbook.pending': { en: 'Thank you! It will appear once the couple approves it.', bn: 'ধন্যবাদ! অনুমোদনের পর এটি দেখা যাবে।' },
  'guestbook.recent': { en: 'Messages', bn: 'শুভেচ্ছাবার্তা' },
  'footer.thanks': { en: 'Thank you for being part of our story.', bn: 'আমাদের গল্পের অংশ হওয়ার জন্য ধন্যবাদ।' },
  'footer.contact': { en: 'Get in touch', bn: 'যোগাযোগ' },
  'footer.madeWith': { en: 'Made with', bn: 'তৈরি' },
  'opening.skip': { en: 'Skip', bn: 'এড়িয়ে যান' },
  'opening.enter': { en: 'Open', bn: 'খুলুন' },
}

/**
 * Returns t(key) → { en, bn } with this precedence: site overrides → tradition → base.
 */
export function createCopy(tradition, overrides = {}) {
  return (key) => overrides[key] || tradition?.copy?.[key] || BASE_COPY[key] || { en: key, bn: '' }
}
