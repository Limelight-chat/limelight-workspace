'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Sparkles } from 'lucide-react'

export default function UpgradePage() {
    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-[#171616] text-slate-100">
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E67820] to-[#ED3658] flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>

                        <h1 className="text-3xl font-serif text-[#d8d3cf]">
                            Upgrade to Pro
                        </h1>

                        <p className="text-slate-400 text-sm">
                            Unlock unlimited queries, priority support, and advanced analytics with Limelight Pro.
                        </p>

                        <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-xl p-6 text-left space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#E67820]" />
                                <span className="text-sm text-slate-300">Unlimited natural language queries</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#E67820]" />
                                <span className="text-sm text-slate-300">Priority query processing</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#E67820]" />
                                <span className="text-sm text-slate-300">Advanced data visualizations</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#E67820]" />
                                <span className="text-sm text-slate-300">Dedicated support channel</span>
                            </div>
                        </div>

                        <button className="w-full py-3 px-4 bg-[#E67820] hover:bg-[#cc6a1c] text-black font-medium rounded-xl transition-colors">
                            Coming Soon
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
