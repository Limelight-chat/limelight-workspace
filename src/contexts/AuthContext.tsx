'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
    name: string
    email: string
    avatar: string
    companyName: string
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const authUser = session?.user ?? null
            setUser(authUser)

            if (authUser) {
                setProfile({
                    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                    email: authUser.email || '',
                    avatar: authUser.user_metadata?.avatar_url || '',
                    companyName: authUser.user_metadata?.company_name || 'My Company',
                })
            }

            setLoading(false)
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            const authUser = session?.user ?? null
            setUser(authUser)

            if (authUser) {
                setProfile({
                    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                    email: authUser.email || '',
                    avatar: authUser.user_metadata?.avatar_url || '',
                    companyName: authUser.user_metadata?.company_name || 'My Company',
                })
            } else {
                setProfile(null)
            }

            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    return useContext(AuthContext)
}
