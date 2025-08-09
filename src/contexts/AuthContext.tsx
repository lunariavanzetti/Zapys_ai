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
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout - forcing loading to false')
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    // Initialize auth
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        console.log('🔄 Environment check:', {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        })
        
        // Get initial session
        console.log('🔄 Getting initial session...')
        const startTime = Date.now()
        const { data: { session }, error } = await supabase.auth.getSession()
        const sessionTime = Date.now() - startTime
        
        console.log(`🔄 getSession completed in ${sessionTime}ms`)
        console.log('🔄 Initial session result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          error: error?.message
        })
        
        if (!mounted) {
          console.log('🔄 Component unmounted during initialization')
          return
        }

        if (error) {
          console.error('❌ Session error details:', {
            message: error.message,
            name: error.name,
            status: error.status
          })
          setLoading(false)
          return
        }

        console.log('✅ Session check:', session ? 'Found session' : 'No session')
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('🔄 Initial session has user, fetching profile...')
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🔄 No user in initial session, setting loading to false')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization exception:', error)
        if (mounted) {
          console.log('🔄 Setting loading to false due to initialization error')
          setLoading(false)
        }
      }
    }

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('🔄 Auth state change ignored - component unmounted')
        return
      }

      console.log('🔄 Auth state change:', event, session ? 'with session' : 'without session')
      console.log('🔄 Session details:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userCreatedAt: session?.user?.created_at
      })
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('🔄 User found in session, fetching profile...')
        await fetchUserProfile(session.user.id)
        
        if (event === 'SIGNED_IN') {
          const isNewUser = new Date().getTime() - new Date(session.user.created_at).getTime() < 30000
          console.log('🔄 New user check:', isNewUser)
          toast.success(isNewUser ? 'Welcome to Zapys AI!' : 'Welcome back!')
        }
      } else {
        console.log('🔄 No user in session, clearing profile')
        setUserProfile(null)
        setLoading(false)
        if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully')
        }
      }
    })

    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching user profile for userId:', userId)
      console.log('👤 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('👤 Starting database query...')
      
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      const queryTime = Date.now() - startTime
      console.log(`👤 Database query completed in ${queryTime}ms`)
      console.log('👤 Query result - data:', data)
      console.log('👤 Query result - error:', error)

      if (error && error.code === 'PGRST116') {
        console.log('👤 User not found in database, creating profile...')
        await createUserProfile(userId)
        return
      }

      if (error) {
        console.error('❌ Profile fetch error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        console.log('👤 Continuing without profile due to error...')
        setUserProfile(null)
        setLoading(false)
        return
      }

      console.log('👤 Setting user profile:', data)
      setUserProfile(data)
      console.log('✅ Profile loaded successfully')
      setLoading(false)
    } catch (error) {
      console.error('❌ Profile fetch exception details:', error)
      console.log('👤 Setting loading to false due to exception')
      setUserProfile(null)
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      console.log('👤 Creating user profile for userId:', userId)
      
      console.log('👤 Getting authenticated user data...')
      const { data: authUser, error: userError } = await supabase.auth.getUser()
      console.log('👤 Auth user data:', authUser)
      console.log('👤 Auth user error:', userError)
      
      if (!authUser.user) {
        console.error('❌ No authenticated user found')
        setLoading(false)
        return
      }

      const profileData = {
        id: userId,
        email: authUser.user.email!,
        full_name: authUser.user.user_metadata?.full_name || null,
        avatar_url: authUser.user.user_metadata?.avatar_url || null,
        subscription_tier: 'free' as const,
        locale: 'en' as const,
        onboarding_completed: false,
      }

      console.log('👤 Profile data to insert:', profileData)
      console.log('👤 Attempting to insert into users table...')

      const startTime = Date.now()
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()
      
      const insertTime = Date.now() - startTime
      console.log(`👤 Insert operation completed in ${insertTime}ms`)
      console.log('👤 Insert result - data:', data)
      console.log('👤 Insert result - error:', error)

      if (error) {
        console.error('❌ Profile creation error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        console.log('👤 Continuing without profile due to creation error...')
        setUserProfile(null)
        setLoading(false)
        return
      }

      console.log('👤 Setting created user profile:', data)
      setUserProfile(data)
      console.log('✅ Profile created successfully')
      setLoading(false)
    } catch (error) {
      console.error('❌ Profile creation exception details:', error)
      console.log('👤 Setting loading to false due to creation exception')
      setUserProfile(null)
      setLoading(false)
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