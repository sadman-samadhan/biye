export const TRADITIONS = {
  muslim: {
    id: 'muslim',
    label: { en: 'Muslim Wedding', bn: 'মুসলিম বিবাহ' },
    icon: '🌙',
    openingInvocation: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    openingSub: 'Bismillahir Rahmanir Rahim',
    defaultBlessing: {
      ar: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
      en: 'And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.',
      bn: 'তাঁর নিদর্শনাবলীর মধ্যে একটি এই যে, তিনি তোমাদের জন্য তোমাদের মধ্য থেকে সঙ্গী সৃষ্টি করেছেন যাতে তোমরা তাদের কাছে শান্তি পাও এবং তিনি তোমাদের মধ্যে ভালোবাসা ও দয়া সৃষ্টি করেছেন।',
      reference: 'সূরা আর-রূম ৩০:২১'
    },
    defaultDuas: [
      {
        arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
        english: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.',
        bengali: 'হে আমাদের পালনকর্তা, আমাদের স্ত্রীদের পক্ষ থেকে এবং আমাদের সন্তানদের পক্ষ থেকে আমাদের জন্যে চোখের শীতলতা দান কর এবং আমাদেরকে মুত্তাকীদের জন্যে আদর্শস্বরূপ কর।',
        reference: { en: "Surah Al-Furqan 25:74", bn: 'সূরা আল-ফুরকান ২৫:৭৪' }
      },
      {
        arabic: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
        english: 'May Allah bless you, shower His blessings upon you, and bring you together in goodness.',
        bengali: 'আল্লাহ আপনাকে বরকত দান করুন, আপনার উপর বরকত নাযিল করুন এবং আপনাদের উভয়কে কল্যাণের সাথে একত্রিত করুন।',
        reference: { en: 'Sunan Abi Dawud 2130', bn: 'সুনান আবু দাউদ ২১৩০' }
      },
      {
        arabic: 'اللَّهُمَّ بَارِكْ لَهُمَا وَبَارِكْ عَلَيْهِمَا وَاجْمَعْ بَيْنَهُمَا فِي خَيْرٍ',
        english: 'O Allah, bless them, shower blessings upon them, and unite them in goodness.',
        bengali: 'হে আল্লাহ, তাদের বরকত দিন, তাদের উপর রহমত বর্ষণ করুন এবং তাদের মাঝে কল্যাণের মিলন ঘটান।',
        reference: { en: 'Traditional Wedding Blessing', bn: 'বিবাহের দোআ' }
      }
    ],
    parentBlessings: {
      title: { en: 'Blessings of the Elders', bn: 'মুরুব্বিদের আশীর্বাদ ও দোয়া' },
      message: {
        en: 'May your home be filled with peace, your hearts with patience, and your journey blessed with unwavering devotion to one another.',
        bn: 'তোমাদের নতুন সংসার ভরে উঠুক প্রশান্তিতে, হৃদয়ে থাকুক ধৈর্য, আর পথচলা ধন্য হোক পরস্পরের প্রতি অটুট ভালোবাসায়।'
      },
      attribution: { en: 'With boundless love, from both families', bn: 'ভালোবাসা ও দোয়ায়, দুই পরিবারের পক্ষ থেকে' }
    },
    placeholderCouple: {
      en: 'Arefin & Sumaiya',
      bn: 'আরেফিন ও সুমাইয়া'
    },
    ceremonies: [
      {
        id: 'gaye-holud',
        slug: 'gaye-holud',
        title: { en: 'Gaye Holud', bn: 'গায়ে হলুদ' },
        subtitle: { en: 'Colors of Joy & Celebration', bn: 'হলুদের রঙে রাঙানো আনন্দ' },
        description: {
          en: 'A vibrant pre-wedding celebration where turmeric paste blesses the union. Surrounded by laughter, music, festive sweets, and the warmth of beloved family.',
          bn: 'বিয়ের আগে আনন্দঘন হলুদের উৎসব, যেখানে পরিবারের সবাই হলুদ মাখিয়ে নবদম্পতিকে আশীর্বাদ ও শুভকামনা জানান।'
        },
        culturalNote: {
          en: 'Gaye Holud is a cherished Bengali tradition where turmeric paste is applied to the bride and groom for purification, auspiciousness, and a radiant glow.',
          bn: 'গায়ে হলুদ বাংলার আবহমান কালের ঐতিহ্যবাহী অনুষ্ঠান, যেখানে বর-কনের গায়ে কাঁচা হলুদ মেখে শুভকামনা ও সৌন্দর্য বৃদ্ধি করা হয়।'
        },
        accentColor: 'saffron',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        dua: {
          ar: 'بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
          en: 'May Allah bless you, shower His blessings upon you, and join you together in goodness.'
        },
        beats: [
          {
            label: 'The Ritual',
            title: { en: 'Turmeric Blessing', bn: 'হলুদ বরণ' },
            description: { en: 'Elders and loved ones apply fragrant turmeric paste with sweets and flowers.', bn: 'মিষ্টিমুখ ও ফুল দিয়ে স্বজনরা বর-কনেকে হলুদ বরণ করেন।' },
            images: []
          },
          {
            label: 'Festivities',
            title: { en: 'Music & Laughter', bn: 'গান ও আনন্দ' },
            description: { en: 'Celebrations with traditional songs, dance, and joyous family bonding.', bn: 'ঐতিহ্যবাহী গান, নাচ ও প্রাণবন্ত পারিবারিক মিলনমেলা।' },
            images: []
          }
        ]
      },
      {
        id: 'mehendi',
        slug: 'mehendi',
        title: { en: 'Mehendi Night', bn: 'মেহেদী রাত' },
        subtitle: { en: 'Intricate Art of Love', bn: 'ভালোবাসার নকশা' },
        description: {
          en: 'An evening of henna artistry where intricate patterns are drawn on hands with celebratory songs and sweet treats.',
          bn: 'মেহেদীর মনোমুগ্ধকর নকশায় হাত রাঙানোর সন্ধ্যা, মুখরিত গান ও মিষ্টির আমেজ।'
        },
        culturalNote: {
          en: 'The deep red hue of henna symbolizes the profound love and prosperity awaiting the new couple.',
          bn: 'মেহেদীর গাঢ় রঙ নবদম্পতির গভীর ভালোবাসা ও সমৃদ্ধির প্রতীক।'
        },
        accentColor: 'terracotta',
        enabled: false,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        dua: {
          ar: 'اللَّهُمَّ بَارِكْ لَهُمَا وَبَارِكْ عَلَيْهِمَا',
          en: 'O Allah, bless them and shower Your blessings upon them.'
        },
        beats: []
      },
      {
        id: 'akht',
        slug: 'akht',
        title: { en: 'The Akht', bn: 'আখত' },
        subtitle: { en: 'The Sacred Nikah', bn: 'পবিত্র নিকাহ' },
        description: {
          en: 'The signing of the eternal contract — a sacred moment of pure devotion where we pledge our lives to one another under the guidance of our faith.',
          bn: 'আল্লাহর ঘরের প্রশান্তিতে পবিত্র নিকাহ সম্পন্ন হলো — ঈমানের আলোয় দুটি জীবনের চিরন্তন প্রতিশ্রুতি।'
        },
        culturalNote: {
          en: 'The solemn exchange of Ijab and Qubool (proposal and acceptance) seals the eternal bond with the blessings of elders and Almighty Allah.',
          bn: 'ঈজাব ও কবুলের মাধ্যমে দুটি হৃদয় চিরতরে এক সূত্রে গাঁথা হয়, মুরুব্বিদের দোয়া ও আল্লাহর অশেষ রহমতে।'
        },
        accentColor: 'clay',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        dua: {
          ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
          en: 'Our Lord, grant us from our spouses comfort to our eyes.'
        },
        beats: [
          {
            label: 'The Sacred Vow',
            title: { en: 'Ijab & Qubool', bn: 'ঈজাব ও কবুল' },
            description: { en: 'With solemn consent, the marriage covenant is formalized.', bn: 'সম্মতি ও কবুল উচ্চারণের মাধ্যমে পবিত্র বৈবাহিক অঙ্গীকার সম্পন্ন হয়।' },
            images: []
          },
          {
            label: 'Blessings',
            title: { en: 'Munajat & Sweets', bn: 'মোনাজাত ও মিষ্টি বিতরণ' },
            description: { en: 'Heartfelt collective prayer for everlasting happiness.', bn: 'নবদম্পতির সুখী জীবনের জন্য সমবেত দোয়া ও শুভেচ্ছা।' },
            images: []
          }
        ]
      },
      {
        id: 'biye',
        slug: 'biye',
        title: { en: 'The Wedding', bn: 'শুভ বিবাহ' },
        subtitle: { en: 'The Grand Celebration', bn: 'মহা আনন্দের দিন' },
        description: {
          en: 'The grand wedding banquet bringing together friends and family in celebration, marked by regal attire, floral splendor, and heartwarming memories.',
          bn: 'পরিবার ও প্রিয়জনদের মহামিলন, বর্ণাঢ্য আয়োজন, ফুলের সুবাস আর অফুরন্ত স্মৃতিতে ভরা শুভ বিবাহের দিন।'
        },
        culturalNote: {
          en: 'The traditional gate-catch ritual, feast, and bride’s farewell (Bidaay) form an emotional and joyous pinnacle of Bengali weddings.',
          bn: 'গেট ধরা, জাঁকজমকপূর্ণ ভোজ এবং বিদায়ের আবেগঘন মুহূর্ত নিয়েই বাঙালির শুভ বিবাহ।'
        },
        accentColor: 'deep-wine',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        dua: {
          ar: 'بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
          en: 'May Allah bless you and unite you in goodness.'
        },
        beats: [
          {
            label: 'The Grand Arrival',
            title: { en: 'Borjatri & Reception', bn: 'বরযাত্রী ও সংবর্ধনা' },
            description: { en: 'Warm floral reception and spirited gate festivities.', bn: 'ফুলেল অভ্যর্থনা ও আনন্দময় গেট ধরার আনুষ্ঠানিকতা।' },
            images: []
          },
          {
            label: 'The Farewell',
            title: { en: 'Bidaay Moments', bn: 'বিদায় বেলা' },
            description: { en: 'An emotional blessing ceremony as the bride steps into her new home.', bn: 'আবেগঘন অশ্রুসিক্ত বিদায় ও নতুন সংসারের শুভ সূচনা।' },
            images: []
          }
        ]
      },
      {
        id: 'bou-bhat',
        slug: 'bou-bhat',
        title: { en: 'Bou Bhat', bn: 'বৌভাত ও ওয়ালিমা' },
        subtitle: { en: 'The Reception Feast', bn: 'সংবর্ধনা ও আপ্যায়ন' },
        description: {
          en: 'The groom family grand reception welcoming the bride, celebrated with exquisite delicacies, warm conversations, and community joy.',
          bn: 'নববধূকে বরণ করে নেওয়ার আনন্দ উৎসব, সুস্বাদু খাবার আর প্রিয়জনদের আন্তরিক শুভেচ্ছায় মুখরিত ওয়ালিমা।'
        },
        culturalNote: {
          en: 'Walima is the Sunnah feast of grateful celebration and the bride is formally welcomed into the groom family hearth.',
          bn: 'বৌভাত বা ওয়ালিমা হলো শুকরিয়া ও অভ্যর্থনার উৎসব, যেখানে নববধূকে পরিবারের হৃদয়ে বরণ করা হয়।'
        },
        accentColor: 'clay',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        dua: {
          ar: 'اللَّهُمَّ بَارِكْ لَهُمَا وَاجْمَعْ بَيْنَهُمَا فِي خَيْرٍ',
          en: 'O Allah, bless them and join them in goodness.'
        },
        beats: []
      }
    ]
  },
  hindu: {
    id: 'hindu',
    label: { en: 'Hindu / Sanatan Wedding', bn: 'সনাতন / হিন্দু বিবাহ' },
    icon: '🪔',
    openingInvocation: '॥ ॐ श्री गणेशाय नमः ॥',
    openingSub: 'Om Shri Ganeshaya Namah',
    defaultBlessing: {
      sa: 'ॐ यदेतद्धृदयं तव तदस्तु हृदयं मम। यदिदं हृदयं मम तदस्तु हृदयं तव।',
      en: 'May my heart be yours, and your heart be mine. Let our hearts be one.',
      bn: 'তোমার হৃদয় হোক আমার, আমার হৃদয় হোক তোমার — আমাদের দুটি হৃদয় এক হোক।',
      reference: 'অথর্ববেদ ৭.৩৬.১'
    },
    defaultDuas: [
      {
        sanskrit: 'ॐ यदेतद्धृदयं तव तदस्तु हृदयं मम। यदिदं हृदयं मम तदस्तु हृदयं तव।',
        english: 'May your heart become mine, and my heart become yours. Let our souls unite as one.',
        bengali: 'তোমার হৃদয় হোক আমার, আর আমার হৃদয় হোক তোমার। আমাদের দুটি সত্তা এক হয়ে উঠুক।',
        reference: { en: 'Atharva Veda 7.36.1', bn: 'অথর্ববেদ ৭.৩৬.১' }
      },
      {
        sanskrit: 'सखा सप्तपदा भव। सख्यं ते गमेयं। सख्यात्ते मा योषं। सख्यान्मे मा योष्ठाः।',
        english: 'Having taken seven steps with me, become my eternal companion. May our friendship never dissolve.',
        bengali: 'সাত পাকে বাঁধা পড়ে তুমি হলে আমার চিরসখা। আমাদের মৈত্রী ও বন্ধন যেন কখনোই ছিন্ন না হয়।',
        reference: { en: 'Saptapadi Mantra', bn: 'সপ্তপদী মন্ত্র' }
      },
      {
        sanskrit: 'ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः।',
        english: 'May the Supreme bring all auspiciousness, peace, and eternal prosperity to this union.',
        bengali: 'পরমেশ্বর এই পবিত্র বন্ধনে সর্বপ্রকার মঙ্গল, শান্তি ও সমৃদ্ধি বর্ষণ করুন।',
        reference: { en: 'Shanti Mantra', bn: 'শান্তি পাঠ' }
      }
    ],
    parentBlessings: {
      title: { en: 'Blessings of the Elders', bn: 'গুরুজনদের আশীর্বাদ' },
      message: {
        en: 'May your life together be luminous like a golden diya, bound by truth, mutual reverence, and enduring harmony.',
        bn: 'তোমাদের দাম্পত্য জীবন প্রদীপের মতো আলোকিত হোক, সত্য, পারস্পরিক শ্রদ্ধা আর অটুট ভালোবাসায় পূর্ণ থাকুক।'
      },
      attribution: { en: 'With eternal love and blessings, from both families', bn: 'স্নেহ ও আশীর্বাদে, উভয় পরিবারের পক্ষ থেকে' }
    },
    placeholderCouple: {
      en: 'Subrata & Priyanka',
      bn: 'সুব্রত ও প্রিয়াঙ্কা'
    },
    ceremonies: [
      {
        id: 'ashirbad',
        slug: 'ashirbad',
        title: { en: 'Ashirbad', bn: 'শুভ আশীর্বাদ' },
        subtitle: { en: 'Blessings from Elders', bn: 'গুরুজনদের আশীর্বাদ' },
        description: {
          en: 'Elders from both families formally accept the sacred union by blessing the bride and groom with husked rice (dhan), trefoil (durba), and heartfelt gifts.',
          bn: 'উভয় পরিবারের প্রবীণ ও গুরুজনরা ধান-দূর্বা দিয়ে বর ও কনেকে প্রাণঢালা আশীর্বাদ ও শুভকামনা জানান।'
        },
        culturalNote: {
          en: 'Dhan (rice) symbolizes fertility and abundance, while Durba (grass) symbolizes resilience, longevity, and purity.',
          bn: 'ধান সমৃদ্ধি ও উর্বরতার প্রতীক, আর দূর্বা ঘাস দীর্ঘায়ু, সহনশীলতা ও চিরন্তন জীবনের প্রতীক।'
        },
        accentColor: 'saffron',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        blessing: {
          sa: 'ॐ आयुष्मान् भव, सौम्य भव',
          en: 'May you live a long, harmonious, and blessed life.'
        },
        beats: [
          {
            label: 'The Blessing',
            title: { en: 'Dhan-Durba Touch', bn: 'ধান-দূর্বা আশীর্বাদ' },
            description: { en: 'Elders bless with auspicious rice and trefoil.', bn: 'ধান ও দূর্বা দিয়ে মুরুব্বিদের কল্যাণময় স্পর্শ।' },
            images: []
          }
        ]
      },
      {
        id: 'aiburo-bhaat',
        slug: 'aiburo-bhaat',
        title: { en: 'Aiburo Bhaat', bn: 'আইবুড়ো ভাত' },
        subtitle: { en: 'The Bachelor Feast', bn: 'কুমার/কুমারী জীবনের শেষ ভোজ' },
        description: {
          en: 'A loving, celebratory feast marking the last meal as an unmarried individual, lovingly cooked and served by close family.',
          bn: 'বিয়ের আগের দিনে পরিবারের আত্মীয়-স্বজনদের আদরমাখা হাতে সাজানো শেষ কুমার/কুমারী ভোজন।'
        },
        culturalNote: {
          en: 'Traditional delicacies like five types of fried items, fish head, and payesh are lovingly prepared to pamper the bride or groom.',
          bn: 'পাঁচ রকম ভাজা, মাছের মাথা আর পায়েস সহ ঐতিহ্যবাহী নানা পদ সাজিয়ে বর-কনেকে পরম মমতায় খাওয়ানো হয়।'
        },
        accentColor: 'clay',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        blessing: {
          sa: 'ॐ अन्नपतेऽन्नस्य नो देहि',
          en: 'May food bring nourishment, joy, and vitality.'
        },
        beats: []
      },
      {
        id: 'gaye-holud',
        slug: 'gaye-holud',
        title: { en: 'Gaye Holud', bn: 'গায়ে হলুদ ও স্নান' },
        subtitle: { en: 'Turmeric & Purification', bn: 'শুদ্ধি ও সৌন্দর্য' },
        description: {
          en: 'The bride and groom are anointed with fragrant turmeric paste sent from each other\'s families, followed by the sacred Snan (bath).',
          bn: 'তত্ত্বের হলুদ ও সুগন্ধিতে বর-কনেকে রাঙানো হয়, এরপর পবিত্র গঙ্গা জলে স্নানের মাধ্যমে শুরু হয় আনন্দময় শুভদিন।'
        },
        culturalNote: {
          en: 'Turmeric is regarded as an auspicious purifier, illuminating skin with radiance while warding off negative energies.',
          bn: 'হলুদকে পবিত্রতা ও শুভত্বের প্রতীক মনে করা হয়, যা জীবনের সকল অমঙ্গল দূর করে নতুন আলোক সূচনা করে।'
        },
        accentColor: 'saffron',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        blessing: {
          sa: 'ॐ भद्रं कर्णेभिः शृणुयाम देवाः',
          en: 'May we hear what is auspicious and pure.'
        },
        beats: []
      },
      {
        id: 'saat-paak',
        slug: 'saat-paak',
        title: { en: 'Saat Paake Bandha & Biye', bn: 'সাত পাকে বাঁধা ও শুভ বিবাহ' },
        subtitle: { en: 'The Sacred Union', bn: 'শুভদৃষ্টি, মালাবদল ও সিঁদুরদান' },
        description: {
          en: 'The bride is carried on a piri around the groom seven times, followed by the first eye contact (Subho Drishti), garland exchange (Mala Badal), sacred fire vows (Saptapadi), and vermilion ceremony (Sindoor Daan).',
          bn: 'পিঁড়িতে সাত পাক, শুভদৃষ্টি, মালাবদল, সপ্তপদী আর সিঁদুরদান — সনাতন বাঙালি বিবাহের সবচেয়ে পবিত্র ও মাহেন্দ্রক্ষণ।'
        },
        culturalNote: {
          en: 'The seven rounds around the sacred fire (Agni) represent seven eternal promises: nourishment, strength, prosperity, happiness, lineage, seasons, and lifelong companionship.',
          bn: 'অগ্নি সাক্ষী রেখে সপ্তপদীর প্রতিটি পদ এক একটি পবিত্র অঙ্গীকার — ধর্ম, অর্থ, কাম ও মোক্ষের চিরন্তন সহযাত্রী হওয়া।'
        },
        accentColor: 'deep-wine',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        blessing: {
          sa: 'सखा सप्तपदा भव। सख्यं ते गमेयं।',
          en: 'Together we have taken seven steps; may we be eternal friends.'
        },
        beats: [
          {
            label: 'The Sacred Eye Contact',
            title: { en: 'Subho Drishti & Mala Badal', bn: 'শুভদৃষ্টি ও মালাবদল' },
            description: { en: 'Behind betel leaves, the couple exchange their first loving glance and floral garlands.', bn: 'পান পাতার আড়াল সরিয়ে প্রথম শুভদৃষ্টি ও মালাবদল।' },
            images: []
          },
          {
            label: 'Eternal Vow',
            title: { en: 'Sindoor Daan & Saptapadi', bn: 'সাত পাক ও সিঁদুরদান' },
            description: { en: 'Walking around the sacred fire and applying the auspicious vermilion.', bn: 'অগ্নি প্রদক্ষিণ ও কনের সিঁথিতে পবিত্র সিঁদুর দান।' },
            images: []
          }
        ]
      },
      {
        id: 'bou-bhaat',
        slug: 'bou-bhaat',
        title: { en: 'Bou Bhaat & Phool Shojja', bn: 'বৌভাত ও সংবর্ধনা' },
        subtitle: { en: 'The Grand Reception', bn: 'ভাত-কাপড়ের দায়িত্ব ও আনন্দ' },
        description: {
          en: 'The groom presents the bride with plate and clothes (Bhaat-Kapor ritual), followed by the grand evening reception welcoming relatives and friends.',
          bn: 'ভাত-কাপড়ের অঙ্গীকার এবং নববধূর হাতের পরিবেশন দিয়ে শুরু হয় সংবর্ধনা ও সান্ধ্যকালীন প্রীতিভোজ।'
        },
        culturalNote: {
          en: 'The bride serves ghee and rice to her new family, symbolizing her nourishing presence and acceptance as the queen of the household.',
          bn: 'নববধূ নিজের হাতে সবাইকে অন্ন পরিবেশন করেন এবং গৃহলক্ষ্মী হিসেবে বরণীয় হন।'
        },
        accentColor: 'clay',
        enabled: true,
        date: { en: '', bn: '' },
        venue: { en: '', bn: '' },
        heroImage: '',
        heroImagePosition: 'center',
        galleryImages: [],
        blessing: {
          sa: 'ॐ आनन्दात् ह्येव खल्विमानि भूतानि जायन्ते',
          en: 'From bliss all beings are born, and in bliss they unite.'
        },
        beats: []
      }
    ]
  }
}

export const CUSTOM_EVENT_PRESETS = [
  {
    id: 'sangeet',
    slug: 'sangeet',
    title: { en: 'Sangeet Night', bn: 'সঙ্গীত ও আনন্দ সন্ধ্যা' },
    subtitle: { en: 'Rhythms, Dance & Melodies', bn: 'গান, নাচ ও সুরের মেলা' },
    description: {
      en: 'An unforgettable musical celebration filled with choreographed dances, soulful melodies, and joyous family performances.',
      bn: 'নাচ, গান আর সুরের মূর্ছনায় মুখরিত এক জাদুকরী সন্ধ্যা, যেখানে দুই পরিবারের সবাই মেতে ওঠেন বাঁধভাঙা উল্লাসে।'
    },
    culturalNote: {
      en: 'Sangeet is a lively pre-wedding musical festival celebrating the harmonious coming together of both families in pure joy.',
      bn: 'সঙ্গীত অনুষ্ঠান হলো দুই পরিবারের হাসি-আনন্দ আর সুরেলা অভিনন্দনের মহা মিলনমেলা।'
    },
    accentColor: 'terracotta',
    enabled: true,
    date: { en: '', bn: '' },
    venue: { en: '', bn: '' },
    heroImage: '',
    heroImagePosition: 'center',
    galleryImages: [],
    beats: [
      {
        label: 'Musical Welcomes',
        title: { en: 'Family Performances', bn: 'পারিবারিক পরিবেশনা' },
        description: { en: 'Lively dances and musical tributes by cousins and friends.', bn: 'বন্ধু ও স্বজনদের চমৎকার নৃত্য ও সঙ্গীত পরিবেশনা।' },
        images: []
      }
    ]
  },
  {
    id: 'mehendi',
    slug: 'mehendi',
    title: { en: 'Mehendi Night', bn: 'মেহেদী রাত' },
    subtitle: { en: 'Intricate Art of Love', bn: 'ভালোবাসার নকশা' },
    description: {
      en: 'An evening of henna artistry where intricate patterns are drawn on hands with celebratory songs and sweet treats.',
      bn: 'মেহেদীর মনোমুগ্ধকর নকশায় হাত রাঙানোর সন্ধ্যা, মুখরিত গান ও মিষ্টির আমেজ।'
    },
    culturalNote: {
      en: 'The deep red hue of henna symbolizes the profound love and prosperity awaiting the new couple.',
      bn: 'মেহেদীর গাঢ় রঙ নবদম্পতির গভীর ভালোবাসা ও সমৃদ্ধির প্রতীক।'
    },
    accentColor: 'terracotta',
    enabled: true,
    date: { en: '', bn: '' },
    venue: { en: '', bn: '' },
    heroImage: '',
    heroImagePosition: 'center',
    galleryImages: [],
    beats: []
  },
  {
    id: 'qawwali',
    slug: 'qawwali',
    title: { en: 'Qawwali & Sufi Night', bn: 'কাওয়ালী ও সুফি সন্ধ্যা' },
    subtitle: { en: 'Spiritual Melodies of Love', bn: 'সুফি সুর ও ভাবাবেগ' },
    description: {
      en: 'A soulful evening of devotional poetry, mesmerizing rhythms, and shared blessings under ambient lighting.',
      bn: 'ভাবপূর্ণ সুফি গান আর ছন্দময় কাওয়ালীর সুরে ভরা এক অপার্থিব সন্ধ্যা, যেখানে হৃদয়ের মিলন ঘটে দোয়ার আলোয়।'
    },
    culturalNote: {
      en: 'Qawwali weaves spiritual reverence and heartfelt romance into an enchanting, unforgettable night.',
      bn: 'কাওয়ালী ও সুফিয়ানা সঙ্গীত দাম্পত্য জীবনে পরম শান্তির আবহ তৈরি করে।'
    },
    accentColor: 'clay',
    enabled: true,
    date: { en: '', bn: '' },
    venue: { en: '', bn: '' },
    heroImage: '',
    heroImagePosition: 'center',
    galleryImages: [],
    beats: []
  },
  {
    id: 'reception',
    slug: 'reception',
    title: { en: 'Grand Reception', bn: 'প্রীতিভোজ ও সংবর্ধনা' },
    subtitle: { en: 'Celebration of Union', bn: 'শুভ মিলন ও আপ্যায়ন' },
    description: {
      en: 'A formal evening banquet celebrating the union with extended family, esteemed guests, and community friends.',
      bn: 'সকল প্রিয়জন, আত্মীয়-স্বজন ও শুভাকাঙ্ক্ষীদের নিয়ে এক মনোজ্ঞ সংবর্ধনা ও প্রীতিভোজের আয়োজন।'
    },
    culturalNote: {
      en: 'The grand reception brings everyone together in gratitude, warmth, and festive dinner celebration.',
      bn: 'সংবর্ধনা হলো সকলের আশীর্বাদ ও ভালোবাসায় নতুন দম্পতিকে অভিনন্দিত করার মহোৎসব।'
    },
    accentColor: 'deep-wine',
    enabled: true,
    date: { en: '', bn: '' },
    venue: { en: '', bn: '' },
    heroImage: '',
    heroImagePosition: 'center',
    galleryImages: [],
    beats: []
  }
]

export function getTradition(id = 'muslim') {
  return TRADITIONS[id] || TRADITIONS.muslim
}

export const CANONICAL_RULES = {
  muslim: [
    { rank: 10, test: (id, en, bn) => /holud|gaye/i.test(`${id} ${en} ${bn}`) },
    { rank: 20, test: (id, en, bn) => /mehendi|henna/i.test(`${id} ${en} ${bn}`) },
    { rank: 30, test: (id, en, bn) => /akht|nikah|akd|আখত|নিকাহ/i.test(`${id} ${en} ${bn}`) },
    { rank: 35, test: (id, en, bn) => /sangeet|music|সঙ্গীত/i.test(`${id} ${en} ${bn}`) },
    { rank: 40, test: (id, en, bn) => /biye|wedding|shadi|বিবাহ/i.test(`${id} ${en} ${bn}`) },
    { rank: 50, test: (id, en, bn) => /bou.?bhat|walima|reception|বৌভাত|ওয়ালিমা|সংবর্ধনা/i.test(`${id} ${en} ${bn}`) },
  ],
  hindu: [
    { rank: 10, test: (id, en, bn) => /ashirbad|আশীর্বাদ/i.test(`${id} ${en} ${bn}`) },
    { rank: 20, test: (id, en, bn) => /aiburo|আইবুড়ো/i.test(`${id} ${en} ${bn}`) },
    { rank: 30, test: (id, en, bn) => /holud|গায়ে/i.test(`${id} ${en} ${bn}`) },
    { rank: 35, test: (id, en, bn) => /sangeet|সঙ্গীত/i.test(`${id} ${en} ${bn}`) },
    { rank: 40, test: (id, en, bn) => /saat.?paak|biye|wedding|বিবাহ/i.test(`${id} ${en} ${bn}`) },
    { rank: 50, test: (id, en, bn) => /bou.?bhat|reception|phool|বৌভাত|সংবর্ধনা/i.test(`${id} ${en} ${bn}`) },
  ]
}

export function getCeremonyCanonicalRank(ceremony, traditionId = 'muslim') {
  const rules = CANONICAL_RULES[traditionId] || CANONICAL_RULES.muslim
  const id = String(ceremony.id || ceremony.slug || '')
  const en = String(ceremony.title?.en || '')
  const bn = String(ceremony.title?.bn || '')

  for (const rule of rules) {
    if (rule.test(id, en, bn)) {
      return rule.rank
    }
  }
  return 100 // custom user celebrations go after standard wedding ceremonies
}

export function sortCeremoniesChronologically(ceremonyList, traditionId = 'muslim') {
  return [...ceremonyList].sort((a, b) => {
    return getCeremonyCanonicalRank(a, traditionId) - getCeremonyCanonicalRank(b, traditionId)
  })
}

export function isWeddingAnchorCeremony(ceremony) {
  const id = String(ceremony.id || ceremony.slug || '')
  const en = String(ceremony.title?.en || '')
  const bn = String(ceremony.title?.bn || '')
  const isExcluded = /holud|gaye|akht|nikah|bou.?bhat|walima|reception|ashirbad|aiburo/i.test(`${id} ${en} ${bn}`)
  if (isExcluded) return false
  return /biye|wedding|saat.?paak|বিবাহ/i.test(`${id} ${en} ${bn}`)
}

export function getProgramTogglePresets(traditionId = 'muslim') {
  if (traditionId === 'hindu') {
    return [
      { id: 'ashirbad', labelEn: 'Ashirbad', labelBn: 'শুভ আশীর্বাদ', icon: '🌾' },
      { id: 'aiburo-bhaat', labelEn: 'Aiburobhat', labelBn: 'আইবুড়ো ভাত', icon: '🍲' },
      { id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ ও স্নান', icon: '✨' },
    ]
  }

  return [
    { id: 'gaye-holud', labelEn: 'Gaye Holud', labelBn: 'গায়ে হলুদ', icon: '💛' },
    { id: 'akht', labelEn: 'The Akht (Nikah)', labelBn: 'পবিত্র আখত', icon: '📜' },
  ]
}
