// Scripture: World English Bible (public domain). Bangla renderings are our own;
// see src/traditions/SOURCES.md for review status.
const blank = { date: { en: '', bn: '' }, venue: { en: '', bn: '' }, heroImage: '', heroImagePosition: 'center', galleryImages: [], beats: [] }

const tradition = {
  id: 'christian',
  label: { en: 'Christian Wedding', bn: 'খ্রিস্টান বিবাহ' },
  icon: '✝',
  aniconic: false,
  invocation: null,
  defaultBlessing: {
    en: 'Love is patient and is kind; love doesn’t envy. Love doesn’t brag, is not proud… bears all things, believes all things, hopes all things, endures all things.',
    bn: 'ভালোবাসা ধৈর্যশীল ও দয়ালু; ভালোবাসা ঈর্ষা করে না, অহংকার করে না… সব সহ্য করে, সব বিশ্বাস করে, সব আশা করে, সব ধৈর্য ধরে।',
    reference: '1 Corinthians 13:4–7',
  },
  defaultDuas: [
    {
      english: 'Where you go, I will go; and where you stay, I will stay. Your people will be my people.',
      bengali: 'তুমি যেখানে যাবে, আমিও সেখানে যাব; তুমি যেখানে থাকবে, আমিও সেখানে থাকব। তোমার আপনজনই হবে আমার আপনজন।',
      reference: { en: 'Ruth 1:16', bn: 'রূত ১:১৬' },
    },
    {
      english: 'A threefold cord is not quickly broken.',
      bengali: 'তিন সুতোয় পাকানো দড়ি সহজে ছেঁড়ে না।',
      reference: { en: 'Ecclesiastes 4:12', bn: 'উপদেশক ৪:১২' },
    },
    {
      english: 'Above all these things, walk in love, which is the bond of perfection.',
      bengali: 'সবকিছুর ওপরে ভালোবাসাকে ধারণ করো, যা সব কিছুকে পূর্ণতার বন্ধনে বাঁধে।',
      reference: { en: 'Colossians 3:14', bn: 'কলসীয় ৩:১৪' },
    },
  ],
  parentBlessings: {
    title: { en: 'From Our Families', bn: 'আমাদের পরিবারের পক্ষ থেকে' },
    message: {
      en: 'May your home be rooted in faith, your days filled with grace, and your love grow deeper with every year.',
      bn: 'তোমাদের সংসার বিশ্বাসে প্রোথিত হোক, দিনগুলো অনুগ্রহে ভরে উঠুক, আর ভালোবাসা প্রতি বছর আরও গভীর হোক।',
    },
    attribution: { en: 'With love and prayers, from both families', bn: 'ভালোবাসা ও প্রার্থনায়, দুই পরিবারের পক্ষ থেকে' },
  },
  placeholderCouple: { en: 'Joseph & Mary', bn: 'জোসেফ ও মেরি' },
  ceremonies: [
    {
      ...blank,
      id: 'engagement',
      slug: 'engagement',
      rank: 10,
      title: { en: 'Engagement', bn: 'বাগদান' },
      subtitle: { en: 'A Promise Made', bn: 'অঙ্গীকারের শুরু' },
      description: { en: 'Rings, prayers and the first blessing of both families.', bn: 'আংটি বদল, প্রার্থনা আর দুই পরিবারের প্রথম আশীর্বাদ।' },
      accentColor: 'saffron',
      enabled: false,
    },
    {
      ...blank,
      id: 'gaye-holud',
      slug: 'gaye-holud',
      rank: 30,
      title: { en: 'Gaye Holud', bn: 'গায়ে হলুদ' },
      subtitle: { en: 'Colours of Joy', bn: 'হলুদের রঙে আনন্দ' },
      description: { en: 'Turmeric, music and laughter with family and friends.', bn: 'হলুদ, গান আর হাসিতে ভরা পারিবারিক আনন্দ।' },
      accentColor: 'saffron',
      enabled: true,
    },
    {
      ...blank,
      id: 'holy-matrimony',
      slug: 'holy-matrimony',
      rank: 50,
      title: { en: 'Holy Matrimony', bn: 'পবিত্র বিবাহ' },
      subtitle: { en: 'Vows Before God', bn: 'ঈশ্বরের সামনে অঙ্গীকার' },
      description: { en: 'The wedding service at church: vows, rings and the blessing of the couple.', bn: 'গির্জায় বিবাহ উপাসনা: শপথ, আংটি বদল আর নবদম্পতির জন্য আশীর্বাদ।' },
      accentColor: 'deep-wine',
      enabled: true,
    },
    {
      ...blank,
      id: 'reception',
      slug: 'reception',
      rank: 72,
      title: { en: 'Reception', bn: 'প্রীতিভোজ' },
      subtitle: { en: 'Celebrating Together', bn: 'একসাথে উদযাপন' },
      description: { en: 'Dinner, toasts and dancing with everyone we love.', bn: 'প্রিয়জনদের সাথে নৈশভোজ, শুভেচ্ছা আর আনন্দ।' },
      accentColor: 'clay',
      enabled: true,
    },
  ],
  extraPresets: ['sangeet', 'mehendi'],
  togglePresets: [
    { id: 'engagement', labelEn: 'Engagement', labelBn: 'বাগদান', icon: '💍' },
    { id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ', icon: '💛' },
  ],
  anchorIds: ['holy-matrimony'],
  dateExtras: [],
  copy: {
    'blessings.title': { en: 'Blessings & Scripture', bn: 'আশীর্বাদ ও বাণী' },
    'blessings.intro': { en: 'Words we hold close as we begin', bn: 'নতুন জীবনের শুরুতে যে বাণী আমাদের সাথে' },
    'spotlight.eyebrow': { en: 'Two Become One', bn: 'দুটি জীবন এক হলো' },
    'monogram.topLabel': { en: 'By the grace of God, together with their families', bn: 'ঈশ্বরের অনুগ্রহে, দুই পরিবারের আশীর্বাদে' },
  },
}

export default tradition
