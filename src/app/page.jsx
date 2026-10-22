import Landing from '@/marketing/Landing'

export const metadata = {
  title: 'ShubhoBiye — Wedding invitations and websites | শুভ বিয়ে',
  description: 'One link for your whole wedding: invitation with RSVP, the wedding days, then your photos. Private by passcode, in English and Bangla, for every tradition.',
  alternates: { languages: { en: '/', bn: '/bn' } },
}

export default function HomePage() {
  return <Landing locale="en" />
}
