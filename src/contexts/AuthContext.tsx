import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, Tables } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  userProfile: Tables<'users'> | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Tables<'users'>>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Tables<'users'> | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Initialize auth
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('❌ Session error:', error)
          setLoading(false)
          return
        }

        console.log('✅ Session check:', session ? 'Found session' : 'No session')
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) setLoading(false)
      }
    }

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔄 Auth state change:', event, session ? 'with session' : 'without session')
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        
        if (event === 'SIGNED_IN') {
          const isNewUser = new Date().getTime() - new Date(session.user.created_at).getTime() < 30000
          toast.success(isNewUser ? 'Welcome to Zapys AI!' : 'Welcome back!')
        }
      } else {
        setUserProfile(null)
        if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully')
        }
      }
      
      setLoading(false)
    })

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching user profile...')
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create profile
        await createUserProfile(userId)
        return
      }

      if (error) {
        console.error('❌ Profile fetch error:', error)
        return
      }

      setUserProfile(data)
      console.log('✅ Profile loaded')
    } catch (error) {
      console.error('❌ Profile fetch exception:', error)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      console.log('👤 Creating user profile...')
      
      const { data: authUser } = await supabase.auth.getUser()
      if (!authUser.user) throw new Error('No authenticated user')

      const profileData = {
        id: userId,
        email: authUser.user.email!,
        full_name: authUser.user.user_metadata?.full_name || null,
        avatar_url: authUser.user.user_metadata?.avatar_url || null,
        subscription_tier: 'free' as const,
        locale: 'en' as const,
        onboarding_completed: false,
      }

      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile creation error:', error)
        return
      }

      setUserProfile(data)
      console.log('✅ Profile created')
    } catch (error) {
      console.error('❌ Profile creation exception:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Signing in with email...')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) console.error('❌ Sign in error:', error)
      return { error }
    } catch (error) {
      console.error('❌ Sign in exception:', error)
      return { error: error as AuthError }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('📝 Signing up with email...')
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (error) console.error('❌ Sign up error:', error)
      return { error }
    } catch (error) {
      console.error('❌ Sign up exception:', error)
      return { error: error as AuthError }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🔑 Signing in with Google...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) console.error('❌ Google sign in error:', error)
      return { error }
    } catch (error) {
      console.error('❌ Google sign in exception:', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      console.log('👋 Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Sign out error:', error)
        toast.error('Error signing out')
        throw error
      }
    } catch (error) {
      console.error('❌ Sign out exception:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Tables<'users'>>) => {
    if (!user) throw new Error('No authenticated user')

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setUserProfile(data)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('❌ Profile update error:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}