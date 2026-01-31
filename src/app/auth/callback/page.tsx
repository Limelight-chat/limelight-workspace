'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        // The supabase client automatically handles the code exchange
        // We just need to wait for the session to be established
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                router.push('/')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#171616] text-[#f5f5f0]">
            <div className="text-center">
                <h2 className="text-2xl font-helvetica mb-4">Verifying your account...</h2>
                <p className="text-[#a3a3a3]">Please wait while we log you in.</p>
            </div>
        </div>
    )
}
