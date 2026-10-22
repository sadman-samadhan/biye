import Landing from '@/marketing/Landing'

export const metadata = {
  title: 'শুভবিয়ে — বিয়ের দাওয়াত ও ওয়েবসাইট | ShubhoBiye',
  description: 'পুরো বিয়ের জন্য একটি লিংক: উত্তরসহ দাওয়াতপত্র, বিয়ের দিন, তারপর আপনাদের ছবি। পাসকোডে সুরক্ষিত, বাংলা ও ইংরেজিতে, সব ধর্মীয় রীতির জন্য।',
  alternates: { languages: { en: '/', bn: '/bn' } },
}

export default function BanglaHomePage() {
  return <Landing locale="bn" />
}
