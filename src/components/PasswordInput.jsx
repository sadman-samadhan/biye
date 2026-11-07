'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** A password field with a button to show or hide what was typed. Takes the same props as <input>. */
export default function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#6B625A] hover:text-[#1E1A17] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#B05A10]"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
