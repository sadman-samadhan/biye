'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function MessageBoard({ siteId }) {
  const [messages, setMessages] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    message: '',
    messageBn: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [siteId])

  async function fetchMessages() {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('approved', true)

      if (siteId && siteId !== 'demo-rafa-shawon') {
        query = query.eq('site_id', siteId)
      }

      const { data } = await query
        .order('created_at', { ascending: false })
        .limit(50)
      
      setMessages(data || [])
    } catch {
      // Graceful offline fallback
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        name_bn: formData.nameBn || null,
        name_urdu: formData.nameBn || null, // fallback compatibility
        message: formData.message,
        message_bn: formData.messageBn || null,
        message_urdu: formData.messageBn || null, // fallback compatibility
        approved: true, // Auto-approve by default for V1
        ...(siteId && siteId !== 'demo-rafa-shawon' ? { site_id: siteId } : {})
      }

      const { error } = await supabase
        .from('messages')
        .insert([payload])

      if (!error) {
        setSubmitted(true)
        setFormData({ name: '', nameBn: '', message: '', messageBn: '' })
        fetchMessages()
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError('Unable to submit message. Please try again.')
      }
    } catch {
      setError('Unable to submit message. Please try again.')
    }

    setIsSubmitting(false)
  }

  return (
    <section className="py-32 bg-bone transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-graphite tracking-tight mb-4">
            Leave Your Blessings
          </h2>
          <p className="font-bangla text-2xl md:text-3xl text-graphite/70">
            আপনার শুভকামনা ও আশীর্বাদ জানান
          </p>
          
          <div className="h-[1px] w-16 bg-clay mx-auto mt-8" />
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto mb-24">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name (English) */}
            <div>
              <label className="font-body text-sm text-graphite/70 uppercase tracking-wide mb-2 block">
                Your Name
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-5 py-4 bg-white/60 border border-warm-grey text-graphite font-body text-base focus:outline-none focus:border-clay transition-colors duration-300 rounded-sm"
                placeholder="e.g. Tanvir Ahmed"
              />
            </div>

            {/* Name (Bengali) - Optional */}
            <div>
              <label className="font-bangla text-sm text-graphite/70 mb-2 block">
                আপনার নাম (বাংলায় - ঐচ্ছিক)
              </label>
              <input
                type="text"
                maxLength={50}
                value={formData.nameBn}
                onChange={(e) => setFormData({...formData, nameBn: e.target.value})}
                className="w-full px-5 py-4 bg-white/60 border border-warm-grey text-graphite font-bangla text-base focus:outline-none focus:border-clay transition-colors duration-300 rounded-sm"
                placeholder="যেমন: তানভীর আহমেদ"
              />
            </div>

            {/* Message (English) */}
            <div>
              <label className="font-body text-sm text-graphite/70 uppercase tracking-wide mb-2 block">
                Your Message
              </label>
              <textarea
                required
                maxLength={300}
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-5 py-4 bg-white/60 border border-warm-grey text-graphite font-body text-base resize-none focus:outline-none focus:border-clay transition-colors duration-300 rounded-sm"
                placeholder="Wishing you a lifetime of endless love, joy, and blessed companionship..."
              />
              <p className="text-xs text-graphite/50 mt-2 text-right">
                {formData.message.length}/300
              </p>
            </div>

            {/* Message (Bengali) - Optional */}
            <div>
              <label className="font-bangla text-sm text-graphite/70 mb-2 block">
                বাংলায় শুভকামনা (ঐচ্ছিক)
              </label>
              <textarea
                maxLength={300}
                rows={4}
                value={formData.messageBn}
                onChange={(e) => setFormData({...formData, messageBn: e.target.value})}
                className="w-full px-5 py-4 bg-white/60 border border-warm-grey text-graphite font-bangla text-base resize-none focus:outline-none focus:border-clay transition-colors duration-300 rounded-sm"
                placeholder="তোমাদের নতুন জীবনের প্রতি রইল রাশি রাশি শুভকামনা..."
              />
              <p className="text-xs text-graphite/50 mt-2 text-right">
                {formData.messageBn.length}/300
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-graphite text-bone font-body text-sm uppercase tracking-wide hover:bg-clay transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-sm"
              >
                {isSubmitting ? 'Sending...' : 'Send Blessings'}
              </button>

              {submitted && (
                <p className="text-emerald-700 font-body text-sm">
                  ✓ Thank you! Your blessings have been received.
                </p>
              )}

              {error && (
                <p className="text-rose-700 font-body text-sm">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Messages List */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="font-display text-2xl md:text-3xl text-graphite text-center mb-12">
              Recent Blessings ({messages.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {messages.map((msg) => {
                const messageBn = msg.message_bn || msg.message_urdu
                const nameBn = msg.name_bn || msg.name_urdu
                const isMsgBangla = Boolean(msg.message_bn) || /[\u0980-\u09FF]/.test(messageBn || '')
                const isNameBangla = Boolean(msg.name_bn) || /[\u0980-\u09FF]/.test(nameBn || '')

                return (
                  <div
                    key={msg.id}
                    className="p-8 bg-white/80 border border-warm-grey rounded-sm shadow-xs transition-transform hover:-translate-y-1 duration-300"
                  >
                    <p className="font-body text-base text-graphite/90 leading-relaxed mb-4">
                      &ldquo;{msg.message}&rdquo;
                    </p>

                    {messageBn && (
                      <p className={`${isMsgBangla ? 'font-bangla' : 'font-arabic direction-rtl'} text-base text-graphite/70 leading-relaxed mb-4`}>
                        &ldquo;{messageBn}&rdquo;
                      </p>
                    )}

                    <div className="border-t border-warm-grey/60 pt-4 flex justify-between items-center text-xs text-graphite/50">
                      <span className="font-body font-medium text-clay uppercase tracking-wider">
                        {msg.name}
                      </span>
                      {nameBn && (
                        <span className={`${isNameBangla ? 'font-bangla' : 'font-arabic direction-rtl'} text-sm`}>
                          {nameBn}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
