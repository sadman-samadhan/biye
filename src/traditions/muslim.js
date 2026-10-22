import ceremonies from './data/muslim-ceremonies.js'
import duas from './data/muslim-duas.js'

const tradition = {
  id: 'muslim',
  label: { en: 'Muslim Wedding', bn: 'মুসলিম বিবাহ' },
  icon: '🌙',
  aniconic: true,
  invocation: { text: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', lang: 'ar', sub: 'Bismillahir Rahmanir Rahim' },
  defaultBlessing: {
    ar: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    en: 'And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.',
    bn: 'তাঁর নিদর্শনাবলীর মধ্যে একটি এই যে, তিনি তোমাদের জন্য তোমাদের মধ্য থেকে সঙ্গী সৃষ্টি করেছেন যাতে তোমরা তাদের কাছে শান্তি পাও এবং তিনি তোমাদের মধ্যে ভালোবাসা ও দয়া সৃষ্টি করেছেন।',
    reference: 'সূরা আর-রূম ৩০:২১',
  },
  defaultDuas: duas,
  parentBlessings: {
    title: { en: 'Blessings of the Elders', bn: 'মুরুব্বিদের আশীর্বাদ ও দোয়া' },
    message: {
      en: 'May your home be filled with peace, your hearts with patience, and your journey blessed with unwavering devotion to one another.',
      bn: 'তোমাদের নতুন সংসার ভরে উঠুক প্রশান্তিতে, হৃদয়ে থাকুক ধৈর্য, আর পথচলা ধন্য হোক পরস্পরের প্রতি অটুট ভালোবাসায়।',
    },
    attribution: { en: 'With boundless love, from both families', bn: 'ভালোবাসা ও দোয়ায়, দুই পরিবারের পক্ষ থেকে' },
  },
  placeholderCouple: { en: 'Arefin & Sumaiya', bn: 'আরেফিন ও সুমাইয়া' },
  ceremonies,
  extraPresets: ['sangeet', 'qawwali', 'reception'],
  togglePresets: [
    { id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ', icon: '💛' },
    { id: 'akht', labelEn: 'The Akht (Nikah)', labelBn: 'পবিত্র আখত', icon: '📜' },
  ],
  anchorIds: ['biye'],
  dateExtras: ['hijri'],
  copy: {
    'nav.blessings': { en: 'Duas', bn: 'দোয়া' },
    'blessings.title': { en: 'Duas & Blessings', bn: 'দোয়া ও শুভকামনা' },
    'blessings.intro': { en: 'Prayers for a blessed life together', bn: 'নতুন জীবনের জন্য দোয়া' },
    'spotlight.eyebrow': { en: 'A Blessed Union', bn: 'বরকতময় বন্ধন' },
    'monogram.topLabel': { en: 'In the name of Allah, the Most Gracious, the Most Merciful', bn: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে' },
    'guestbook.title': { en: 'Leave Your Duas', bn: 'আপনার দোয়া ও শুভকামনা জানান' },
    'invite.wording': {
      en: 'By the grace of Almighty Allah, we joyfully invite you and your family to the wedding of our children',
      bn: 'মহান আল্লাহর অশেষ রহমতে আমাদের সন্তানদের শুভ বিবাহে আপনাকে সপরিবারে সাদর আমন্ত্রণ জানাচ্ছি',
    },
    'invite.closing': { en: 'With duas and warm regards', bn: 'দোয়াপ্রার্থী' },
  },
}

export default tradition
