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
  signInWithApple: () => Promise<{ error: AuthError | null }>
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
    // Force stop loading after 10 seconds for OAuth flows
    const maxLoadingTimeout = setTimeout(() => {
      console.log('🚨 FORCE STOPPING AUTH LOADING - 10 second timeout')
      setLoading(false)
    }, 10000)

    // Get initial session immediately
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔥 AUTH CONTEXT: Initial session check', { session: !!session, error })
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        console.log('✅ AUTH CONTEXT: User found, fetching profile')
        fetchUserProfile(session.user.id)
      } else {
        console.log('❌ AUTH CONTEXT: No user, stopping loading')
        setLoading(false)
      }
      clearTimeout(maxLoadingTimeout) // Clear timeout if we got a result
    }).catch((error) => {
      console.error('❌ AUTH CONTEXT: Session check failed', error)
      setLoading(false)
      clearTimeout(maxLoadingTimeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AUTH CONTEXT: Auth state change', { event, session: !!session, userId: session?.user?.id })
      console.log('🔔 AUTH CONTEXT: User email:', session?.user?.email)
      console.log('🔔 AUTH CONTEXT: User created at:', session?.user?.created_at)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('✅ AUTH CONTEXT: Session user found, fetching profile')
        await fetchUserProfile(session.user.id)
        setLoading(false) // Stop loading once we have user
      } else {
        console.log('❌ AUTH CONTEXT: No session user')
        setUserProfile(null)
        setLoading(false)
      }

      // Handle auth events
      if (event === 'SIGNED_IN') {
        console.log('🎉 AUTH CONTEXT: SIGNED_IN event')
        // Check if this is a new user (created in the last few seconds)
        const userCreatedAt = new Date(session?.user?.created_at || '')
        const now = new Date()
        const isNewUser = (now.getTime() - userCreatedAt.getTime()) < 10000 // 10 seconds
        
        if (isNewUser) {
          console.log('🆕 New user detected, first time login')
          toast.success('Welcome to Zapys AI! Account created successfully.')
        } else {
          console.log('👋 Returning user, welcome back')
          toast.success('Welcome back!')
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 AUTH CONTEXT: SIGNED_OUT event')
        toast.success('Signed out successfully')
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(maxLoadingTimeout)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      // Add timeout to prevent hanging
      const profileTimeout = setTimeout(() => {
        console.log('⏰ Profile fetch timeout - proceeding without profile')
        setUserProfile(null)
        setLoading(false)
      }, 3000)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      clearTimeout(profileTimeout)

      if (error) {
        console.log('Error fetching user profile:', error)
        // If user doesn't exist in our users table, create them
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('User not found, creating profile...')
          await createUserProfile(userId)
          return
        }
        console.error('Database error:', error)
        // Don't throw error, just continue without profile
        setUserProfile(null)
      } else {
        console.log('User profile loaded:', data)
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Don't show error to user for profile issues
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      console.log('Creating user profile for:', userId)
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

      console.log('Inserting profile data:', profileData)
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error inserting user profile:', error)
        // If table doesn't exist or permission issue, just continue without profile
        setUserProfile(null)
      } else {
        console.log('User profile created:', data)
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      // Don't show error to user, just continue without profile
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = import.meta.env.VITE_APP_URL 
      ? `${import.meta.env.VITE_APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`
      
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const redirectUrl = import.meta.env.VITE_APP_URL 
      ? `${import.meta.env.VITE_APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    return { error }
  }

  const signInWithApple = async () => {
    const redirectUrl = import.meta.env.VITE_APP_URL 
      ? `${import.meta.env.VITE_APP_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUrl,
      },
    })
    return { error }
  }

  const signOut = async () => {
    console.log('🔥 AUTH CONTEXT: Starting signOut process...')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ AUTH CONTEXT: Sign out error:', error)
        toast.error('Error signing out: ' + error.message)
        throw error
      } else {
        console.log('✅ AUTH CONTEXT: Sign out successful')
        // Manually clear state to ensure immediate UI update
        setUser(null)
        setSession(null)
        setUserProfile(null)
      }
    } catch (error) {
      console.error('❌ AUTH CONTEXT: Sign out failed:', error)
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
      console.error('Error updating profile:', error)
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
    signInWithApple,
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