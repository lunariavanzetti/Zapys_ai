import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔥 AUTH CALLBACK: Starting auth callback process')
        console.log('🔥 AUTH CALLBACK: URL:', window.location.href)
        
        // Check Supabase configuration
        console.log('🔥 AUTH CALLBACK: Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING')
        console.log('🔥 AUTH CALLBACK: Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING')
        console.log('🔥 AUTH CALLBACK: App URL:', import.meta.env.VITE_APP_URL)
        
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        
        console.log('🔥 AUTH CALLBACK: OAuth code present:', !!code)
        console.log('🔥 AUTH CALLBACK: OAuth code length:', code?.length || 0)
        console.log('🔥 AUTH CALLBACK: Error in URL:', error)
        
        if (error) {
          console.error('🔥 AUTH CALLBACK: OAuth error in URL:', error)
          setStatus('error')
          setTimeout(() => navigate(`/auth?error=oauth_${error}`), 2000)
          return
        }

        if (!code) {
          console.error('🔥 AUTH CALLBACK: No OAuth code found')
          setStatus('error')
          setTimeout(() => navigate('/auth?error=no_code'), 2000)
          return
        }

        console.log('🔥 AUTH CALLBACK: Attempting to get session...')
        
        // Test Supabase connectivity first
        console.log('🔥 AUTH CALLBACK: Testing Supabase connectivity...')
        try {
          const startTime = Date.now()
          const healthCheck = await Promise.race([
            fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
              method: 'HEAD',
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              }
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 3000))
          ]) as Response
          const responseTime = Date.now() - startTime
          console.log('🔥 AUTH CALLBACK: Supabase connectivity:', healthCheck.status, `(${responseTime}ms)`)
        } catch (connectivityError) {
          console.error('🔥 AUTH CALLBACK: Supabase connectivity failed:', connectivityError)
        }
        
        // Use auth state listener approach instead of direct session calls
        console.log('🔥 AUTH CALLBACK: Using auth state listener approach...')
        
        let authTimeout: NodeJS.Timeout | null = null
        let authListener: { data: { subscription: any } } | null = null
        
        // Set up a one-time auth state listener
        const authPromise = new Promise((resolve, reject) => {
          console.log('🔥 AUTH CALLBACK: Setting up auth state listener...')
          
          authTimeout = setTimeout(() => {
            console.log('🔥 AUTH CALLBACK: Auth listener timeout after 10 seconds')
            if (authListener) {
              authListener.data.subscription.unsubscribe()
            }
            reject(new Error('Auth listener timeout'))
          }, 10000)
          
          authListener = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔥 AUTH CALLBACK: Auth state change detected:', {
              event,
              hasSession: !!session,
              userEmail: session?.user?.email
            })
            
            if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              console.log('✅ AUTH CALLBACK: Authentication successful via listener!')
              
              // Clean up
              if (authTimeout) clearTimeout(authTimeout)
              if (authListener) authListener.data.subscription.unsubscribe()
              
              // Check if this is a new user
              const userCreatedAt = new Date(session.user.created_at)
              const now = new Date()
              const isNewAccount = (now.getTime() - userCreatedAt.getTime()) < 60000
              
              console.log('🔥 AUTH CALLBACK: User created at:', userCreatedAt)
              console.log('🔥 AUTH CALLBACK: Is new user:', isNewAccount)
              
              resolve({ session, isNewAccount })
            } else if (event === 'SIGNED_OUT') {
              console.log('🔥 AUTH CALLBACK: Sign out detected, ignoring')
            }
          })
        })
        
        try {
          console.log('🔥 AUTH CALLBACK: Waiting for auth state change...')
          const { session, isNewAccount } = await authPromise as any
          
          setIsNewUser(isNewAccount)
          setStatus('success')
          setTimeout(() => navigate('/dashboard'), 1000)
          return
          
        } catch (authErr) {
          console.error('🔥 AUTH CALLBACK: Auth listener failed:', authErr)
          
          // Clean up
          if (authTimeout) clearTimeout(authTimeout)
          if (authListener) authListener.data.subscription.unsubscribe()
          
          setStatus('error')
          setTimeout(() => navigate('/auth?error=auth_timeout'), 2000)
          return
        }
      } catch (err) {
        console.error('🔥 AUTH CALLBACK: Unexpected error:', err)
        setStatus('error')
        setTimeout(() => navigate('/auth?error=unexpected'), 2000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center">
      <div className="text-center">
        <div className="brutal-card p-12 mb-8 electric-pulse">
          <div className="w-32 h-32 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto flex items-center justify-center animate-spin mb-8">
            <Zap className="h-16 w-16 text-brutalist-black" />
          </div>

          <div className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-widest">
            {status === 'processing' && 'PROCESSING...'}
            {status === 'success' && (isNewUser ? 'ACCOUNT CREATED!' : 'WELCOME BACK!')}
            {status === 'error' && 'SOMETHING WENT WRONG'}
          </div>
          
          <div className="text-lg text-electric-500 font-bold uppercase tracking-wider">
            {status === 'processing' && 'AUTHENTICATING YOUR ACCOUNT'}
            {status === 'success' && (isNewUser ? 'SETTING UP YOUR WORKSPACE' : 'REDIRECTING TO DASHBOARD')}
            {status === 'error' && 'REDIRECTING TO LOGIN'}
          </div>
        </div>
      </div>
    </div>
  )
}