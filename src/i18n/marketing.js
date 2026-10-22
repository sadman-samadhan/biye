/**
 * Marketing site wording in English and Bangla. Prices are set here; `null`
 * shows "Ask us" so nothing is advertised before it is decided.
 */

export const WHATSAPP_NUMBER = '8801954638110'

export const PRICES = { invite: null, memories: null, complete: '৳3,499' }

export const MARKETING = {
  en: {
    locale: 'en',
    other: { href: '/bn', label: 'বাংলা' },
    nav: { themes: 'Themes', how: 'How it works', pricing: 'Pricing', faq: 'Questions', login: 'Couple login' },
    hero: {
      eyebrow: 'Wedding websites for Bangladeshi families',
      title: 'One link for your whole wedding.',
      body: 'Send it as your invitation, open it on the day for times and maps, and come back to it for the photos. Private by passcode, in English and Bangla.',
      primary: 'See the themes',
      secondary: 'Message us on WhatsApp',
    },
    trust: ['Private by passcode', 'English & বাংলা', 'Muslim · Hindu · Christian · Buddhist · Universal', 'Photos protected from casual saving'],
    gallery: {
      title: 'Six themes, each its own world',
      body: 'Not colour swaps: every theme has its own layout, typefaces, photo shapes, ornaments and opening.',
      all: 'All',
      traditionLabel: 'Tradition',
      moodLabel: 'Mood',
      open: 'Open demo',
      details: 'Details',
      empty: 'No theme matches both filters yet.',
    },
    evolve: {
      title: 'One link that grows with your wedding',
      steps: [
        { name: 'Invitation', when: 'Weeks before', body: 'Your families, the events, a countdown, maps, calendar buttons and RSVP. Share it on WhatsApp with a QR code for printed cards.' },
        { name: 'The day', when: 'Wedding days', body: 'The same link shows what is happening today, with directions and a livestream button for family abroad.' },
        { name: 'Memories', when: 'Afterwards', body: 'When your photos are ready, it becomes your wedding website: story, ceremonies, gallery and guestbook.' },
      ],
    },
    how: {
      title: 'How it works',
      steps: [
        { name: 'Message us', body: 'Tell us your date, tradition and which theme you like.' },
        { name: 'We set it up', body: 'Your link, passcode and first draft within a day or two.' },
        { name: 'You add the details', body: 'Sign in to edit wording, events and photos yourself, from your phone.' },
        { name: 'Share', body: 'Send the link and passcode on WhatsApp, or print the QR code on your cards.' },
      ],
    },
    features: {
      title: 'What you get',
      items: [
        { name: 'Guest passcode', body: 'Only people with your passcode see your photos. Change it any time to lock everyone out at once.' },
        { name: 'Protected photos', body: 'Guests get smaller copies through short-lived links. Right-click and long-press saving are blocked, and the viewer’s name is shown over enlarged photos. Screenshots can’t be blocked by any website.' },
        { name: 'Your own login', body: 'Edit everything yourselves: wording, events, photos, RSVPs, passcode.' },
        { name: 'RSVP and calendar', body: 'Guests reply and can change their answer; you download the list for Excel. Events go straight into their calendar.' },
        { name: 'Tradition-aware', body: 'Bismillah, Shri Shri Prajapataye Namah or no invocation at all; ceremonies, verses and wording for each tradition.' },
        { name: 'Bangla throughout', body: 'Names, dates, Bangla calendar and Hijri dates, and every label in Bangla beside English.' },
        { name: 'Colours from your photo', body: 'Pick a palette, or let us suggest one from your cover photo (Google Gemini looks at that one photo only).' },
        { name: 'All your photos back', body: 'Download every photo you uploaded in full size whenever you like.' },
      ],
    },
    pricing: {
      title: 'Pricing',
      body: 'Pay once by bKash, Nagad or bank transfer. No subscription.',
      ask: 'Ask us',
      cta: 'Book on WhatsApp',
      plans: [
        { id: 'invite', name: 'Invitation', body: 'Before and on the wedding days.', items: ['Themed invitation with your families and events', 'Countdown, maps and calendar buttons', 'RSVP with Excel download', 'Passcode, QR code and WhatsApp sharing'] },
        { id: 'complete', name: 'Complete', featured: true, body: 'Invitation and memories on one link.', items: ['Everything in Invitation', 'Everything in Memories', 'One link from invitation to photos', 'Priority help on WhatsApp'] },
        { id: 'memories', name: 'Memories', body: 'Your wedding website afterwards.', items: ['Story, ceremonies and gallery', 'Guestbook with moderation', 'Protected photos and passcode', 'Download all photos in full size'] },
      ],
    },
    faq: {
      title: 'Questions',
      items: [
        { q: 'Who can see our site?', a: 'Before the wedding the invitation can be open to anyone with the link or need the passcode; the photos after the wedding need the passcode unless you choose otherwise. Sites are never listed on Google.' },
        { q: 'Can guests download our photos?', a: 'Saving by right-click or long-press is blocked and guests only get smaller copies. No website can stop a screenshot or a camera, so the guest’s name appears over enlarged photos to discourage sharing.' },
        { q: 'Can we change things ourselves?', a: 'Yes. You get your own login to edit wording, events and photos, see RSVPs and change the passcode.' },
        { q: 'Is it only for Muslim weddings?', a: 'No. There are Muslim, Hindu (Bengali and North Indian), Christian, Buddhist and non-religious versions, and every theme works with each.' },
        { q: 'What happens to our photos?', a: 'They are stored privately and shown to guests only through links that expire. You can download all of them whenever you like.' },
        { q: 'How do we pay?', a: 'Message us on WhatsApp. We take bKash, Nagad and bank transfer.' },
      ],
    },
    footer: { tagline: 'Wedding websites for Bangladeshi families.', themes: 'Themes', credits: 'Demo photo credits', login: 'Couple login' },
  },

  bn: {
    locale: 'bn',
    other: { href: '/', label: 'English' },
    nav: { themes: 'থিম', how: 'কীভাবে কাজ করে', pricing: 'মূল্য', faq: 'প্রশ্ন', login: 'লগইন' },
    hero: {
      eyebrow: 'বাংলাদেশি পরিবারের জন্য বিয়ের ওয়েবসাইট',
      title: 'পুরো বিয়ের জন্য একটি লিংক।',
      body: 'দাওয়াতপত্র হিসেবে পাঠান, বিয়ের দিন সময় আর ম্যাপের জন্য খুলুন, পরে ছবির জন্য আবার ফিরে আসুন। পাসকোডে সুরক্ষিত, ইংরেজি ও বাংলায়।',
      primary: 'থিমগুলো দেখুন',
      secondary: 'হোয়াটসঅ্যাপে মেসেজ দিন',
    },
    trust: ['পাসকোডে সুরক্ষিত', 'English ও বাংলা', 'মুসলিম · হিন্দু · খ্রিস্টান · বৌদ্ধ · সর্বজনীন', 'ছবি সহজে সেভ করা যায় না'],
    gallery: {
      title: 'ছয়টি থিম, প্রতিটি আলাদা জগৎ',
      body: 'শুধু রং বদল নয়: প্রতিটি থিমের নিজস্ব লেআউট, অক্ষর, ছবির আকার, নকশা আর শুরুর অ্যানিমেশন।',
      all: 'সব',
      traditionLabel: 'ধর্ম',
      moodLabel: 'মেজাজ',
      open: 'ডেমো দেখুন',
      details: 'বিস্তারিত',
      empty: 'দুটো ফিল্টারের সাথে মেলে এমন থিম এখনো নেই।',
    },
    evolve: {
      title: 'একটি লিংক, বিয়ের সাথে বদলায়',
      steps: [
        { name: 'দাওয়াত', when: 'কয়েক সপ্তাহ আগে', body: 'দুই পরিবার, অনুষ্ঠানসূচি, কাউন্টডাউন, ম্যাপ, ক্যালেন্ডার আর আসছেন কিনা জানানোর ব্যবস্থা। হোয়াটসঅ্যাপে পাঠান, ছাপানো কার্ডে দিন QR কোড।' },
        { name: 'বিয়ের দিন', when: 'অনুষ্ঠানের দিনগুলোতে', body: 'একই লিংকে আজকের অনুষ্ঠান, পথনির্দেশ আর প্রবাসী আত্মীয়দের জন্য সরাসরি সম্প্রচারের বোতাম।' },
        { name: 'স্মৃতি', when: 'বিয়ের পরে', body: 'ছবি তৈরি হলে এটিই হয়ে যায় আপনাদের বিয়ের ওয়েবসাইট: গল্প, অনুষ্ঠান, ছবি আর শুভেচ্ছাবার্তা।' },
      ],
    },
    how: {
      title: 'কীভাবে কাজ করে',
      steps: [
        { name: 'মেসেজ দিন', body: 'তারিখ, ধর্মীয় রীতি আর পছন্দের থিম জানান।' },
        { name: 'আমরা সাজিয়ে দিই', body: 'এক-দুই দিনের মধ্যে আপনার লিংক, পাসকোড আর প্রথম খসড়া।' },
        { name: 'আপনি বিস্তারিত দিন', body: 'ফোন থেকেই লগইন করে লেখা, অনুষ্ঠান আর ছবি বদলান।' },
        { name: 'শেয়ার করুন', body: 'হোয়াটসঅ্যাপে লিংক আর পাসকোড পাঠান, অথবা কার্ডে QR কোড ছাপান।' },
      ],
    },
    features: {
      title: 'যা যা পাবেন',
      items: [
        { name: 'অতিথিদের পাসকোড', body: 'পাসকোড ছাড়া কেউ আপনার ছবি দেখতে পারবে না। যেকোনো সময় বদলে সবাইকে একসাথে বের করে দিতে পারবেন।' },
        { name: 'সুরক্ষিত ছবি', body: 'অতিথিরা পান ছোট কপি, অল্প সময়ের লিংকে। রাইট-ক্লিক বা চেপে ধরে সেভ বন্ধ, বড় ছবিতে দর্শকের নাম দেখায়। স্ক্রিনশট কোনো ওয়েবসাইটই আটকাতে পারে না।' },
        { name: 'নিজেদের লগইন', body: 'লেখা, অনুষ্ঠান, ছবি, উত্তর, পাসকোড — সব নিজেরাই বদলান।' },
        { name: 'উত্তর আর ক্যালেন্ডার', body: 'অতিথিরা জানান আসছেন কিনা, পরে বদলাতেও পারেন; আপনি তালিকা Excel-এ নামান। অনুষ্ঠান সরাসরি তাদের ক্যালেন্ডারে।' },
        { name: 'রীতি অনুযায়ী', body: 'বিসমিল্লাহ, শ্রীশ্রী প্রজাপতয়ে নমঃ, অথবা কোনো আহ্বান ছাড়াই; প্রতিটি রীতির অনুষ্ঠান, বাণী আর ভাষা।' },
        { name: 'পুরোটাই বাংলায়', body: 'নাম, তারিখ, বাংলা সন ও হিজরি তারিখ, আর ইংরেজির পাশে প্রতিটি লেখা বাংলায়।' },
        { name: 'ছবি থেকে রং', body: 'পছন্দের রং বেছে নিন, অথবা প্রচ্ছদের ছবি থেকে রং সাজিয়ে নিন (Google Gemini শুধু সেই একটি ছবি দেখে)।' },
        { name: 'সব ছবি ফেরত', body: 'আপলোড করা সব ছবি যখন খুশি পূর্ণ মাপে নামিয়ে নিন।' },
      ],
    },
    pricing: {
      title: 'মূল্য',
      body: 'বিকাশ, নগদ বা ব্যাংকে একবারই পরিশোধ। কোনো মাসিক চার্জ নেই।',
      ask: 'জিজ্ঞেস করুন',
      cta: 'হোয়াটসঅ্যাপে বুক করুন',
      plans: [
        { id: 'invite', name: 'দাওয়াত', body: 'বিয়ের আগে ও বিয়ের দিনগুলোতে।', items: ['দুই পরিবার ও অনুষ্ঠানসহ থিমভিত্তিক দাওয়াতপত্র', 'কাউন্টডাউন, ম্যাপ আর ক্যালেন্ডার', 'উত্তরের তালিকা Excel-এ', 'পাসকোড, QR কোড আর হোয়াটসঅ্যাপে শেয়ার'] },
        { id: 'complete', name: 'সম্পূর্ণ', featured: true, body: 'একই লিংকে দাওয়াত আর স্মৃতি।', items: ['দাওয়াতের সবকিছু', 'স্মৃতির সবকিছু', 'দাওয়াত থেকে ছবি পর্যন্ত একটাই লিংক', 'হোয়াটসঅ্যাপে অগ্রাধিকার সহায়তা'] },
        { id: 'memories', name: 'স্মৃতি', body: 'বিয়ের পরের ওয়েবসাইট।', items: ['গল্প, অনুষ্ঠান আর ছবি', 'অনুমোদনসহ শুভেচ্ছাবার্তা', 'সুরক্ষিত ছবি আর পাসকোড', 'সব ছবি পূর্ণ মাপে নামানো'] },
      ],
    },
    faq: {
      title: 'প্রশ্ন',
      items: [
        { q: 'আমাদের সাইট কারা দেখতে পারবে?', a: 'বিয়ের আগে দাওয়াতপত্র লিংক থাকলেই খোলা যেতে পারে বা পাসকোড লাগতে পারে; বিয়ের পরের ছবির জন্য পাসকোড লাগে, যদি না আপনি অন্যভাবে চান। কোনো সাইট গুগলে দেখায় না।' },
        { q: 'অতিথিরা কি আমাদের ছবি নামাতে পারবে?', a: 'রাইট-ক্লিক বা চেপে ধরে সেভ বন্ধ, আর অতিথিরা শুধু ছোট কপি পান। স্ক্রিনশট বা ক্যামেরা কোনো ওয়েবসাইট আটকাতে পারে না, তাই বড় ছবিতে অতিথির নাম দেখায়।' },
        { q: 'আমরা কি নিজেরা বদলাতে পারব?', a: 'হ্যাঁ। নিজেদের লগইনে লেখা, অনুষ্ঠান, ছবি, উত্তর আর পাসকোড সব বদলাতে পারবেন।' },
        { q: 'এটা কি শুধু মুসলিম বিয়ের জন্য?', a: 'না। মুসলিম, হিন্দু (বাঙালি ও উত্তর ভারতীয়), খ্রিস্টান, বৌদ্ধ আর ধর্মনিরপেক্ষ সংস্করণ আছে, আর প্রতিটি থিম সবগুলোর সাথে চলে।' },
        { q: 'আমাদের ছবির কী হয়?', a: 'ছবিগুলো গোপনে রাখা হয়, আর অতিথিরা দেখেন শুধু মেয়াদি লিংকে। যখন খুশি সব ছবি নামিয়ে নিতে পারবেন।' },
        { q: 'টাকা কীভাবে দেব?', a: 'হোয়াটসঅ্যাপে মেসেজ দিন। বিকাশ, নগদ আর ব্যাংক ট্রান্সফার নেওয়া হয়।' },
      ],
    },
    footer: { tagline: 'বাংলাদেশি পরিবারের জন্য বিয়ের ওয়েবসাইট।', themes: 'থিম', credits: 'ডেমো ছবির কৃতজ্ঞতা', login: 'লগইন' },
  },
}

export const MOODS = {
  dramatic: { en: 'Dramatic', bn: 'নাটকীয়' },
  modern: { en: 'Modern', bn: 'আধুনিক' },
  regal: { en: 'Regal', bn: 'রাজকীয়' },
  heritage: { en: 'Heritage', bn: 'ঐতিহ্য' },
  ornate: { en: 'Ornate', bn: 'নকশাদার' },
  serene: { en: 'Serene', bn: 'শান্ত' },
  modest: { en: 'Modest', bn: 'সংযত' },
  festive: { en: 'Festive', bn: 'উৎসবমুখর' },
  bold: { en: 'Bold', bn: 'সাহসী' },
  handmade: { en: 'Handmade', bn: 'হাতে-বোনা' },
  playful: { en: 'Playful', bn: 'প্রাণবন্ত' },
  editorial: { en: 'Editorial', bn: 'পত্রিকা-ধাঁচ' },
}

export const OPENINGS = {
  film: { en: 'A film title card parts to reveal your names', bn: 'সিনেমার টাইটেলের মতো পর্দা সরে নাম দেখায়' },
  'arch-doors': { en: 'Carved jali doors swing open', bn: 'জালি-কাটা দরজা খুলে যায়' },
  'arch-light': { en: 'An arch is drawn in light and you pass through it', bn: 'আলোয় খিলান আঁকা হয়, আপনি তার ভেতর দিয়ে ঢোকেন' },
  alpona: { en: 'Alpona draws itself on red, then blooms open', bn: 'লালের ওপর আলপনা আঁকা হয়ে ফুটে ওঠে' },
  stitch: { en: 'A stitch traces your names, then the quilt opens', bn: 'সেলাইয়ে নাম ফুটে ওঠে, তারপর কাঁথা খুলে যায়' },
  cover: { en: 'The magazine cover turns like a page', bn: 'ম্যাগাজিনের প্রচ্ছদ পাতার মতো উল্টে যায়' },
}

export const whatsappUrl = (locale = 'en') =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(locale === 'bn' ? 'হ্যালো শুভবিয়ে! বিয়ের ওয়েবসাইট নিয়ে জানতে চাই।' : "Hi ShubhoBiye! I'd like a wedding website.")}`
