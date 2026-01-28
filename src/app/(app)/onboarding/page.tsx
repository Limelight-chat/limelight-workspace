'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OnboardingPage() {
    const router = useRouter()
    const [companyName, setCompanyName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!companyName.trim()) {
            setError('Please enter your company name')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    company_name: companyName.trim()
                }
            })

            if (updateError) throw updateError

            router.push('/chat')
        } catch (err: any) {
            setError(err.message || 'Failed to save company name')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171616]/70 backdrop-blur-sm px-4">
            {/* Modal Container */}
            <div className="w-full max-w-lg bg-[#2f2f2f] rounded-2xl shadow-2xl overflow-hidden">

                {/* Header Section */}
                <div className="px-8 pt-8 pb-6">
                    <h1 className="text-2xl font-semibold text-[#f5f5f0] mb-2">
                        Welcome to Limelight
                    </h1>
                    <p className="text-[#a3a3a3] text-sm">
                        Let's set up your workspace. Tell us about your organization.
                    </p>
                </div>

                {/* Content Card */}
                <div className="mx-6 mb-6 bg-[#3d3d3d] rounded-xl p-5">
                    <div className="inline-block px-3 py-1 bg-[#4a4a4a] rounded-full text-xs text-[#c4c4c4] mb-4">
                        Getting started
                    </div>

                    <h2 className="text-base font-medium text-[#f5f5f0] mb-2">
                        Company or Organization Name
                    </h2>
                    <p className="text-[#a3a3a3] text-sm mb-4">
                        Enter your company or organization name. This will be displayed in your workspace.
                    </p>

                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Inc."
                        disabled={loading}
                        className="w-full px-4 py-3 bg-[#2f2f2f] border border-[#4a4a4a] rounded-lg text-[#f5f5f0] placeholder-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#E67820] focus:border-transparent disabled:opacity-50 text-sm"
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-400">{error}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-[#6b6b6b] mb-4">
                        You can change this later in your account settings.
                    </p>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#f5f5f0] hover:bg-[#e5e5e0] disabled:bg-[#4a4a4a] disabled:text-[#6b6b6b] text-[#1a1a1a] font-medium rounded-xl transition-colors text-sm cursor-pointer"
                    >
                        {loading ? 'Setting up...' : 'Accept'}
                    </button>
                </div>
            </div>
        </div>
    )
}
