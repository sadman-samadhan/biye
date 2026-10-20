// No religious text. Verses are from Rabindranath Tagore (public domain).
const blank = { date: { en: '', bn: '' }, venue: { en: '', bn: '' }, heroImage: '', heroImagePosition: 'center', galleryImages: [], beats: [] }

const tradition = {
  id: 'universal',
  label: { en: 'No religious text', bn: 'ধর্মীয় লেখা ছাড়া' },
  icon: '✿',
  aniconic: false,
  invocation: null,
  defaultBlessing: {
    bn: 'তোমারেই যেন ভালোবাসিয়াছি শত রূপে শত বার, জনমে জনমে, যুগে যুগে অনিবার।',
    en: 'I seem to have loved you in numberless forms, numberless times, in life after life, in age after age, forever.',
    reference: 'Rabindranath Tagore · অনন্ত প্রেম',
  },
  defaultDuas: [
    {
      bengali: 'আমার পরান যাহা চায়, তুমি তাই, তুমি তাই গো।',
      english: 'All that my heart longs for — it is you, only you.',
      reference: { en: 'Rabindranath Tagore', bn: 'রবীন্দ্রনাথ ঠাকুর' },
    },
  ],
  parentBlessings: {
    title: { en: 'From Our Families', bn: 'আমাদের পরিবারের পক্ষ থেকে' },
    message: {
      en: 'May you always find home in each other, laughter in ordinary days, and courage for every new beginning.',
      bn: 'একে অপরের মাঝে যেন সবসময় ঘর খুঁজে পাও, সাধারণ দিনেও খুঁজে পাও হাসি, আর প্রতিটি নতুন শুরুতে সাহস।',
    },
    attribution: { en: 'With love, from both families', bn: 'ভালোবাসায়, দুই পরিবারের পক্ষ থেকে' },
  },
  placeholderCouple: { en: 'Rahim & Karima', bn: 'রহিম ও করিমা' },
  ceremonies: [
    {
      ...blank,
      id: 'gaye-holud',
      slug: 'gaye-holud',
      rank: 30,
      title: { en: 'Gaye Holud', bn: 'গায়ে হলুদ' },
      subtitle: { en: 'Colours of Joy', bn: 'হলুদের রঙে আনন্দ' },
      description: { en: 'Turmeric, music and laughter with the people we love.', bn: 'প্রিয়জনদের সাথে হলুদ, গান আর হাসি।' },
      accentColor: 'saffron',
      enabled: true,
    },
    {
      ...blank,
      id: 'wedding',
      slug: 'wedding',
      rank: 50,
      title: { en: 'The Wedding', bn: 'বিয়ে' },
      subtitle: { en: 'Two Become One', bn: 'দুটি জীবন এক হলো' },
      description: { en: 'The day we promise each other forever.', bn: 'যেদিন আমরা চিরদিনের অঙ্গীকার করি।' },
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
      description: { en: 'Dinner and dancing with everyone we love.', bn: 'প্রিয়জনদের সাথে নৈশভোজ আর আনন্দ।' },
      accentColor: 'clay',
      enabled: true,
    },
  ],
  extraPresets: ['sangeet', 'mehendi'],
  togglePresets: [{ id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ', icon: '💛' }],
  anchorIds: ['wedding'],
  dateExtras: [],
  copy: {
    'nav.blessings': { en: 'Words', bn: 'কথা' },
    'blessings.title': { en: 'Words of Love', bn: 'ভালোবাসার কথা' },
    'blessings.intro': { en: 'Lines that say it better than we can', bn: 'যে কথা আমাদের মনের কথা' },
    'guestbook.title': { en: 'Leave a Message', bn: 'শুভেচ্ছা জানান' },
  },
}

export default tradition
