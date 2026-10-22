import ceremonies from './data/hindu-ceremonies.js'
import duas from './data/hindu-duas.js'

const base = {
  id: 'hindu',
  label: { en: 'Hindu Wedding', bn: 'হিন্দু বিবাহ' },
  icon: '🪔',
  aniconic: false,
  defaultBlessing: {
    sa: 'ॐ यदेतद्धृदयं तव तदस्तु हृदयं मम। यदिदं हृदयं मम तदस्तु हृदयं तव।',
    en: 'May my heart be yours, and your heart be mine. Let our hearts be one.',
    bn: 'তোমার হৃদয় হোক আমার, আমার হৃদয় হোক তোমার — আমাদের দুটি হৃদয় এক হোক।',
    reference: 'অথর্ববেদ ৭.৩৬.১',
  },
  defaultDuas: duas,
  parentBlessings: {
    title: { en: 'Blessings of the Elders', bn: 'গুরুজনদের আশীর্বাদ' },
    message: {
      en: 'May your life together be luminous like a golden diya, bound by truth, mutual reverence, and enduring harmony.',
      bn: 'তোমাদের দাম্পত্য জীবন প্রদীপের মতো আলোকিত হোক, সত্য, পারস্পরিক শ্রদ্ধা আর অটুট ভালোবাসায় পূর্ণ থাকুক।',
    },
    attribution: { en: 'With eternal love and blessings, from both families', bn: 'স্নেহ ও আশীর্বাদে, উভয় পরিবারের পক্ষ থেকে' },
  },
  placeholderCouple: { en: 'Subrata & Priyanka', bn: 'সুব্রত ও প্রিয়াঙ্কা' },
  ceremonies,
  extraPresets: ['sangeet', 'mehendi', 'reception'],
  togglePresets: [
    { id: 'ashirbad', labelEn: 'Ashirbad', labelBn: 'শুভ আশীর্বাদ', icon: '🌾' },
    { id: 'aiburo-bhaat', labelEn: 'Aiburobhat', labelBn: 'আইবুড়ো ভাত', icon: '🍲' },
    { id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ ও স্নান', icon: '✨' },
  ],
  anchorIds: ['saat-paak'],
  dateExtras: ['bangla-calendar'],
  copy: {
    'blessings.title': { en: 'Blessings', bn: 'আশীর্বাদ' },
    'blessings.intro': { en: 'Sacred words for a sacred bond', bn: 'পবিত্র বন্ধনের মঙ্গলবাণী' },
    'spotlight.eyebrow': { en: 'Shubho Bibaho', bn: 'শুভ বিবাহ' },
    'monogram.topLabel': { en: 'With the blessings of the gods and our elders', bn: 'দেবতা ও গুরুজনদের আশীর্বাদে' },
    'guestbook.title': { en: 'Leave Your Blessings', bn: 'আপনার আশীর্বাদ জানান' },
    'invite.wording': {
      en: 'With the blessings of the gods and our elders, we cordially invite you and your family to the auspicious wedding of our children',
      bn: 'আমাদের সন্তানদের শুভ বিবাহে আপনি সবান্ধবে উপস্থিত থেকে নবদম্পতিকে আশীর্বাদ করে বাধিত করবেন',
    },
    'invite.closing': { en: 'With regards', bn: 'বিনীত' },
  },
}

/**
 * Variants change the invocation and ceremony wording, not the data shape.
 * Bengali Hindu wedding cards traditionally open with "শ্রীশ্রী প্রজাপতয়ে নমঃ".
 */
const tradition = {
  ...base,
  defaultVariant: 'bengali',
  variants: {
    bengali: {
      label: { en: 'Bengali Hindu', bn: 'বাঙালি হিন্দু' },
      invocation: { text: 'শ্রীশ্রী প্রজাপতয়ে নমঃ', lang: 'bn', sub: 'Shri Shri Prajapataye Namah' },
    },
    'north-indian': {
      label: { en: 'North Indian Hindu', bn: 'উত্তর ভারতীয় হিন্দু' },
      invocation: { text: '॥ ॐ श्री गणेशाय नमः ॥', lang: 'sa', sub: 'Om Shri Ganeshaya Namah' },
    },
  },
}

export default tradition
