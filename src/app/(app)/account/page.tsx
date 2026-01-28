'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { User, Mail, Calendar } from 'lucide-react'

export default function AccountPage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        loadUser()
    }, [])

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-[#171616] text-slate-100">
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-[#1f1e1e] border border-[#2e2d2d] flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>

                        <h1 className="text-3xl font-serif text-[#d8d3cf]">
                            Account
                        </h1>

                        <p className="text-slate-400 text-sm">
                            Manage your account settings and preferences.
                        </p>

                        <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-xl p-6 text-left space-y-5">
                            <div className="flex items-start gap-4">
                                <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</div>
                                    <div className="text-sm text-slate-200">{user?.email || 'Loading...'}</div>
                                </div>
                            </div>

                            <div className="border-t border-[#2e2d2d]" />

                            <div className="flex items-start gap-4">
                                <User className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Name</div>
                                    <div className="text-sm text-slate-200">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Loading...'}</div>
                                </div>
                            </div>

                            <div className="border-t border-[#2e2d2d]" />

                            <div className="flex items-start gap-4">
                                <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Member Since</div>
                                    <div className="text-sm text-slate-200">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Loading...'}</div>
                                </div>
                            </div>
                        </div>

                        <button disabled className="w-full py-3 px-4 bg-[#2a2929] text-slate-500 font-medium rounded-xl cursor-not-allowed">
                            Edit Profile (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
