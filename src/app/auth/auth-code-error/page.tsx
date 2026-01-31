'use client'

import { Navbar5 } from '@/components/navbar5'
import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen bg-[#171616] text-[#f5f5f0] font-sans">
            <Navbar5 />
            <main className="flex min-h-[calc(100vh-5rem)] pt-20 items-center justify-center">
                <div className="w-full max-w-md p-6 bg-[#1f1e1e] border border-[#2e2d2d] rounded-2xl shadow-2xl text-center">
                    <h2 className="text-xl font-helvetica font-semibold mb-4 text-red-500">Authentication Error</h2>
                    <p className="text-sm text-[#a3a3a3] mb-6">
                        There was an issue verifying your account. The link may be invalid or expired.
                    </p>
                    <Link
                        href="/signin"
                        className="inline-block bg-[#f5f5f0] hover:bg-[#e5e5e0] text-[#171616] py-2.5 px-6 rounded-lg font-medium transition-colors"
                    >
                        Try Logging In
                    </Link>
                </div>
            </main>
        </div>
    )
}
