import LegalPage from '@/marketing/LegalPage'

export const metadata = { title: 'Privacy | ShubhoBiye' }

const SECTIONS = [
  {
    title: 'What we keep',
    list: [
      'For couples and our team: your email address and sign-in details.',
      'For each wedding site: what the couple adds, such as names, dates, venues, their story, photos and videos.',
      'From guests who reply to an invitation: their name, the number of guests, which events they will attend, an optional phone number and an optional note.',
      'From guests who write in a guestbook: their name and message.',
      'A scrambled (hashed) form of visitors’ internet addresses, kept for up to a day, so we can stop people guessing passcodes or sending spam.',
    ],
  },
  {
    title: 'What we do not do',
    list: [
      'We do not sell or share anyone’s information for advertising, and we use no advertising or tracking tools.',
      'Wedding sites are hidden from search engines.',
      'The name a guest types at the passcode screen stays in a cookie on their own device; we do not store it.',
    ],
  },
  {
    title: 'Photos',
    body: [
      'Photos are stored privately. Guests only receive resized copies through links that expire after a few hours, and only after entering the passcode when the couple requires one. The original-size copies are available only to the couple and our team.',
      'We block right-click and long-press saving and show the guest’s name over enlarged photos, but no website can prevent screenshots or someone photographing a screen.',
      'If the couple asks for colours from a photo, that one photo is sent to Google’s Gemini service to suggest a palette. Nothing else is sent to it.',
    ],
  },
  {
    title: 'Cookies',
    list: [
      'A sign-in cookie for couples and our team.',
      'A cookie on a guest’s device after they enter the passcode, so they are not asked again (30 days).',
      'A cookie on a guest’s device after they reply to an invitation, so they can change their reply (180 days).',
    ],
  },
  {
    title: 'Who stores it',
    body: [
      'The site runs on Vercel. Information and photos are stored with Supabase, and photos may be stored with Cloudflare. These companies process the information only to run the service.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'A wedding site and its photos are kept for the period of the couple’s plan. The couple can download all their photos at any time. When a site is deleted, its photos, replies and messages are deleted with it. Couples can ask us to delete their site sooner.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'Couples can see, change, download and delete their content from their dashboard, or ask us to do it. Guests who want a reply or message removed can ask the couple, or contact us on WhatsApp at +880 1954 638110.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="23 October 2026"
      intro="ShubhoBiye makes private wedding invitations and websites. This page explains, in plain words, what we keep about couples and their guests, and why."
      sections={SECTIONS}
    />
  )
}
