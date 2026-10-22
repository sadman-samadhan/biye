// Pali verses from the Maṅgala Sutta (public domain). Bangla renderings are our
// own; see src/traditions/SOURCES.md for review status.
const blank = { date: { en: '', bn: '' }, venue: { en: '', bn: '' }, heroImage: '', heroImagePosition: 'center', galleryImages: [], beats: [] }

const tradition = {
  id: 'buddhist',
  label: { en: 'Buddhist Wedding', bn: 'বৌদ্ধ বিবাহ' },
  icon: '☸',
  aniconic: false,
  invocation: { text: 'Namo tassa bhagavato arahato sammāsambuddhassa', lang: 'pi', sub: 'নমো তস্স ভগবতো অরহতো সম্মাসম্বুদ্ধস্স' },
  defaultBlessing: {
    pi: 'Mātāpitu upaṭṭhānaṃ, puttadārassa saṅgaho; anākulā ca kammantā, etaṃ maṅgalamuttamaṃ.',
    en: 'To support one’s parents, to cherish one’s family, to work with a calm and steady mind — this is the highest blessing.',
    bn: 'মা-বাবার সেবা, পরিবারকে স্নেহে আগলে রাখা, শান্ত ও নিষ্ঠার সাথে কর্ম করা — এটিই উত্তম মঙ্গল।',
    reference: 'Maṅgala Sutta',
  },
  defaultDuas: [
    {
      pali: 'Dānañca dhammacariyā ca, ñātakānañca saṅgaho; anavajjāni kammāni, etaṃ maṅgalamuttamaṃ.',
      english: 'Generosity, living by the Dhamma, caring for one’s relatives, and blameless deeds — this is the highest blessing.',
      bengali: 'দান, ধর্মপথে জীবনযাপন, আত্মীয়স্বজনের প্রতি যত্ন আর নিষ্কলুষ কর্ম — এটিই উত্তম মঙ্গল।',
      reference: { en: 'Maṅgala Sutta', bn: 'মঙ্গল সূত্র' },
    },
    {
      pali: 'Gāravo ca nivāto ca, santuṭṭhi ca kataññutā.',
      english: 'Respect, humility, contentment and gratitude.',
      bengali: 'শ্রদ্ধা, বিনয়, সন্তুষ্টি ও কৃতজ্ঞতা।',
      reference: { en: 'Maṅgala Sutta', bn: 'মঙ্গল সূত্র' },
    },
  ],
  parentBlessings: {
    title: { en: 'Blessings of the Elders', bn: 'গুরুজনদের আশীর্বাদ' },
    message: {
      en: 'May your life together be calm as still water, kind in every word, and bright with shared merit.',
      bn: 'তোমাদের যুগল জীবন হোক স্থির জলের মতো শান্ত, প্রতিটি কথায় করুণাময়, আর সম্মিলিত পুণ্যে উজ্জ্বল।',
    },
    attribution: { en: 'With metta, from both families', bn: 'মৈত্রী ও আশীর্বাদে, দুই পরিবারের পক্ষ থেকে' },
  },
  placeholderCouple: { en: 'Ananda & Mitra', bn: 'আনন্দ ও মিত্রা' },
  ceremonies: [
    {
      ...blank,
      id: 'ashirbad',
      slug: 'ashirbad',
      rank: 10,
      title: { en: 'Ashirbad', bn: 'আশীর্বাদ' },
      subtitle: { en: 'Blessing of the Families', bn: 'পরিবারের আশীর্বাদ' },
      description: { en: 'Elders bless the couple and the families formally agree.', bn: 'গুরুজনেরা নবদম্পতিকে আশীর্বাদ করেন, দুই পরিবারের সম্মতি পাকা হয়।' },
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
      description: { en: 'Turmeric, songs and the warmth of family.', bn: 'হলুদ, গান আর পরিবারের উষ্ণতা।' },
      accentColor: 'saffron',
      enabled: true,
    },
    {
      ...blank,
      id: 'mangala',
      slug: 'mangala',
      rank: 50,
      title: { en: 'Wedding & Paritta', bn: 'শুভ বিবাহ ও পরিত্রাণ পাঠ' },
      subtitle: { en: 'Vows and Blessing Chants', bn: 'অঙ্গীকার ও মঙ্গলপাঠ' },
      description: { en: 'Monks chant the Paritta and the couple make their vows before family and friends.', bn: 'ভিক্ষুসংঘের পরিত্রাণ পাঠ আর প্রিয়জনদের সামনে নবদম্পতির অঙ্গীকার।' },
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
      description: { en: 'A feast with everyone who blessed us.', bn: 'সবাইকে নিয়ে আনন্দভোজ।' },
      accentColor: 'clay',
      enabled: true,
    },
  ],
  extraPresets: ['sangeet', 'mehendi'],
  togglePresets: [
    { id: 'ashirbad', labelEn: 'Ashirbad', labelBn: 'আশীর্বাদ', icon: '🌾' },
    { id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ', icon: '💛' },
  ],
  anchorIds: ['mangala'],
  dateExtras: ['bangla-calendar'],
  copy: {
    'blessings.title': { en: 'Blessings', bn: 'মঙ্গল কামনা' },
    'blessings.intro': { en: 'From the Maṅgala Sutta', bn: 'মঙ্গল সূত্র থেকে' },
    'spotlight.eyebrow': { en: 'A Blessed Path', bn: 'মঙ্গলময় পথচলা' },
    'monogram.topLabel': { en: 'With metta, together with their families', bn: 'মৈত্রীময় আশীর্বাদে, দুই পরিবারের সাথে' },
    'invite.wording': {
      en: 'With the blessings of the Triple Gem, we warmly invite you and your family to the wedding of our children',
      bn: 'ত্রিরত্নের আশীর্বাদে আমাদের সন্তানদের শুভ বিবাহে আপনাকে সপরিবারে সাদর আমন্ত্রণ',
    },
    'invite.closing': { en: 'With metta', bn: 'মৈত্রীসহ' },
  },
}

export default tradition
