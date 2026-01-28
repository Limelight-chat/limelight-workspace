'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CreditCard, Receipt, Clock } from 'lucide-react'

export default function BillingPage() {
    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-[#171616] text-slate-100">
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-full bg-[#1f1e1e] border border-[#2e2d2d] flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-slate-400" />
                        </div>

                        <h1 className="text-3xl font-serif text-[#d8d3cf]">
                            Billing
                        </h1>

                        <p className="text-slate-400 text-sm">
                            View your subscription and payment history.
                        </p>

                        <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-xl p-6 text-left space-y-5">
                            <div className="flex items-start gap-4">
                                <Receipt className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Plan</div>
                                    <div className="text-sm text-slate-200">Free Plan</div>
                                </div>
                            </div>

                            <div className="border-t border-[#2e2d2d]" />

                            <div className="flex items-start gap-4">
                                <Clock className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Usage This Month</div>
                                    <div className="text-sm text-slate-200">52 queries</div>
                                </div>
                            </div>

                            <div className="border-t border-[#2e2d2d]" />

                            <div className="flex items-start gap-4">
                                <CreditCard className="w-5 h-5 text-slate-500 mt-0.5" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Payment Method</div>
                                    <div className="text-sm text-slate-200">No payment method on file</div>
                                </div>
                            </div>
                        </div>

                        <button disabled className="w-full py-3 px-4 bg-[#2a2929] text-slate-500 font-medium rounded-xl cursor-not-allowed">
                            Manage Subscription (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
