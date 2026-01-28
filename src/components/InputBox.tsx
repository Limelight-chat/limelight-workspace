"use client"

import { useState } from "react"
import { IconPlus, IconHistory } from "@tabler/icons-react"
import { ArrowUp } from "lucide-react"
import { useRouter } from "next/navigation"


interface InputBoxProps {
  onSubmit?: (query: string) => void
}

export default function InputBox({ onSubmit }: InputBoxProps) {
  const router = useRouter()
  const [text, setText] = useState("")

  const hasText = text.trim().length > 0

  const handleSubmit = () => {
    if (hasText && onSubmit) {
      onSubmit(text)
      setText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-[#2a2929] border border-[#3e3e3e] rounded-[1.5rem] p-3 shadow-lg transition-colors focus-within:border-gray-600">
      <textarea
        placeholder="How can I help you today?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-slate-100 placeholder-slate-400/70 resize-none focus:outline-none min-h-[50px] max-h-[200px] px-2 py-1 text-[15px] leading-relaxed"
        rows={text.split('\n').length > 1 ? Math.min(text.split('\n').length, 8) : 1}
      />

      <div className="flex items-center justify-between mt-2 px-1">
        {/* Left Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push('/connections')}
            className="p-1.5 text-slate-400 hover:text-[#E67820] hover:bg-[#E67820]/10 rounded-lg transition-colors"
          >
            <IconPlus size={20} stroke={2} />
          </button>

          <button
            onClick={() => router.push('/history')}
            className="p-1.5 text-slate-400 hover:text-[#E67820] hover:bg-[#E67820]/10 rounded-lg transition-colors"
          >
            <IconHistory size={20} stroke={2} />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-medium">52% used</span>

          <button
            onClick={handleSubmit}
            disabled={!hasText}
            className={`p-1.5 rounded-lg transition-all duration-200 ${hasText
              ? 'bg-[#E67820] text-white hover:bg-[#E67820]/90 shadow-sm'
              : 'bg-[#3e3e3e] text-slate-500 cursor-not-allowed'
              }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}