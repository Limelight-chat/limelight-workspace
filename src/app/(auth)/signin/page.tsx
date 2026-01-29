'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar5 } from '@/components/navbar5'

export default function SignIn() {
    const router = useRouter()
    const [isSignUp, setIsSignUp] = useState(true) // Default to Sign Up as requested
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (isSignUp) {
                // Sign Up flow
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setMessage({
                    text: 'Check your email to confirm your account!',
                    type: 'success',
                })
            } else {
                // Sign In flow
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                // Successful login
                router.push('/')
                router.refresh()
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            setMessage({
                text: errorMessage,
                type: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#171616] text-[#f5f5f0] font-sans selection:bg-[#cc6a1c] selection:text-white">
            <Navbar5 />

            {/* Main Content Grid */}
            <main className="grid md:grid-cols-2 min-h-screen pt-20">

                {/* Left Side: Auth & Hero Text */}
                <div className="flex flex-col justify-center px-8 md:px-24 lg:px-32 py-8">
                    <div className="mb-8">
                        <h1 className="font-helvetica text-5xl md:text-6xl leading-[1.1] mb-4 text-[#f5f5f0]">
                            The search engine <br />
                            from the future.
                        </h1>
                        <p className="text-[#a3a3a3] text-lg font-light">
                            Enterprise-grade AI search for modern teams
                        </p>
                    </div>

                    {/* Auth Box */}
                    <div className="w-full max-w-sm">
                        <div className="bg-[#1f1e1e] border border-[#2e2d2d] rounded-2xl p-6 shadow-2xl">
                            <div className="mb-6">
                                <h2 className="text-xl font-helvetica font-semibold mb-1">
                                    {isSignUp ? 'Create your account' : 'Welcome back'}
                                </h2>
                                <p className="text-sm text-[#a3a3a3]">
                                    {isSignUp ? 'Get started with Limelight today' : 'Enter your email to sign in'}
                                </p>
                            </div>

                            <form onSubmit={handleAuth} className="space-y-4">
                                {/* Google Button Placeholder */}
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-center gap-2 bg-[#2f2f2f] hover:bg-[#383838] text-[#f5f5f0] py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#3d3d3d] cursor-pointer"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-[#3d3d3d]"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs text-[#6b6b6b] uppercase">or</span>
                                    <div className="flex-grow border-t border-[#3d3d3d]"></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="w-full bg-[#2f2f2f] border border-[#3d3d3d] text-[#f5f5f0] px-4 py-2.5 rounded-lg text-sm placeholder-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#E67820] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            minLength={6}
                                            className="w-full bg-[#2f2f2f] border border-[#3d3d3d] text-[#f5f5f0] px-4 py-2.5 rounded-lg text-sm placeholder-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#E67820] focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#f5f5f0] hover:bg-[#e5e5e0] text-[#171616] py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {loading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign In')}
                                    </button>
                                </div>
                            </form>

                            {message && (
                                <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success'
                                    ? 'bg-green-900/30 text-green-400 border border-green-900'
                                    : 'bg-red-900/30 text-red-400 border border-red-900'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Toggle Sign Up / Sign In Logic */}
                            <div className="mt-6 text-center text-sm text-[#a3a3a3]">
                                {isSignUp ? (
                                    <>
                                        Already a member?{' '}
                                        <button
                                            onClick={() => setIsSignUp(false)}
                                            className="text-[#f5f5f0] hover:text-white font-medium underline-offset-4 hover:underline transition-colors cursor-pointer"
                                        >
                                            Sign in here
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        New to Limelight?{' '}
                                        <button
                                            onClick={() => setIsSignUp(true)}
                                            className="text-[#f5f5f0] hover:text-white font-medium underline-offset-4 hover:underline transition-colors cursor-pointer"
                                        >
                                            Sign up here
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Visual */}
                <div className="hidden md:block relative bg-[#E67820]/10 overflow-hidden m-4 rounded-3xl">
                    {/* This replicates the colored box/image area from the reference */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E67820] to-[#b04d16] opacity-90"></div>

                    {/* Abstract placeholder visual */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[#f5f5f0] opacity-20 font-serif text-9xl italic">
                            Aa
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}
