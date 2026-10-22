import LegalPage from '@/marketing/LegalPage'

export const metadata = { title: 'Terms | ShubhoBiye' }

const SECTIONS = [
  {
    title: 'The service',
    body: [
      'ShubhoBiye makes a wedding invitation and website at shubhobiye.com/your-names, which the couple can edit. What is included depends on the plan chosen: Invitation, Memories or Complete.',
    ],
  },
  {
    title: 'Your content',
    list: [
      'You keep ownership of everything you add. You allow us to store it and show it to the people you share your link and passcode with.',
      'Only upload photos you have the right to share, and only of people who are happy to be shown to your guests.',
      'Do not use the service for anything unlawful, hateful or harmful. We may remove such content or suspend a site.',
    ],
  },
  {
    title: 'Privacy and its limits',
    body: [
      'We protect sites with passcodes and keep photos private, as described in our privacy notice. Anyone you give the passcode to can see what it unlocks, and no website can stop screenshots, so share the passcode only with people you trust.',
    ],
  },
  {
    title: 'Payment and plans',
    body: [
      'Plans are paid once, by bKash, Nagad or bank transfer, before the site goes live. The plan sets how long the site stays online and how many photos it can hold; we will tell you both before you pay. Before a site expires we will remind you, so you can download your photos or extend.',
    ],
  },
  {
    title: 'Availability and changes',
    body: [
      'We work to keep sites online and fast but cannot promise they will never be interrupted. We may improve or change the service; we will not remove something you have paid for during your plan without offering a fair alternative or refund.',
    ],
  },
  {
    title: 'Responsibility',
    body: [
      'To the extent the law allows, our responsibility for any problem is limited to the amount you paid for your plan. Nothing here limits rights you have under the laws of Bangladesh.',
    ],
  },
  {
    title: 'Contact',
    body: ['Questions or complaints: WhatsApp +880 1954 638110. These terms are governed by the laws of Bangladesh.'],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="23 October 2026"
      intro="These terms apply to couples who use ShubhoBiye and to everyone who visits a wedding site. Please read them with our privacy notice."
      sections={SECTIONS}
    />
  )
}
