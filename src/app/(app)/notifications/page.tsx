'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Bell, Mail, MessageSquare, Zap } from 'lucide-react'

export default function NotificationsPage() {
    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-[#171616] text-slate-100">
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-[#1f1e1e] border border-[#2e2d2d] flex items-center justify-center">
                            <Bell className="w-8 h-8 text-slate-400" />
                        </div>

                        <h1 className="text-3xl font-serif text-[#d8d3cf]">
                            Notifications
                        </h1>

                        <p className="text-slate-400 text-sm">
                            Configure how you receive updates and alerts.
                        </p>

                        <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-xl p-6 text-left space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm text-slate-300">Email notifications</span>
                                </div>
                                <div className="w-10 h-6 bg-[#2e2d2d] rounded-full relative cursor-not-allowed">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full" />
                                </div>
                            </div>

                            <div className="border-t border-[#2e2d2d]" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm text-slate-300">Query completion alerts</span>
                                </div>
                                <div className="w-10 h-6 bg-[#E67820]/30 rounded-full relative cursor-not-allowed">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-[#E67820] rounded-full" />
                                </div>
                            </div>

                            <div className="border-t border-[#2e2d2d]" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm text-slate-300">Product updates</span>
                                </div>
                                <div className="w-10 h-6 bg-[#E67820]/30 rounded-full relative cursor-not-allowed">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-[#E67820] rounded-full" />
                                </div>
                            </div>
                        </div>

                        <button disabled className="w-full py-3 px-4 bg-[#2a2929] text-slate-500 font-medium rounded-xl cursor-not-allowed">
                            Save Preferences (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
