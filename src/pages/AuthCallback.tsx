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
        
        // Skip manual code handling and just check current session
        console.log('🔥 AUTH CALLBACK: Skipping code exchange, checking if session exists...')
        
        // Wait a moment for Supabase to automatically process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simple session check without manual code exchange
        console.log('🔥 AUTH CALLBACK: Checking for existing session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('🔥 AUTH CALLBACK: Session check result:', {
          hasSession: !!session,
          error: sessionError?.message,
          userEmail: session?.user?.email
        })
        
        if (session) {
          console.log('✅ AUTH CALLBACK: Found existing session!')
          
          // Check if this is a new user
          const userCreatedAt = new Date(session.user.created_at)
          const now = new Date()
          const isNewAccount = (now.getTime() - userCreatedAt.getTime()) < 60000
          
          setIsNewUser(isNewAccount)
          setStatus('success')
          setTimeout(() => navigate('/dashboard'), 1000)
          return
        }
        
        // If no session found, there might be an OAuth configuration issue
        console.log('❌ AUTH CALLBACK: No session found, redirecting to auth with error')
        setStatus('error')
        setTimeout(() => navigate('/auth?error=oauth_failed'), 2000)
        return
        
        // Fallback to getSession with timeout
        console.log('🔥 AUTH CALLBACK: Falling back to getSession() with timeout...')
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        console.log('🔥 AUTH CALLBACK: Session result:', { 
          hasSession: !!session, 
          error: sessionError,
          userEmail: session?.user?.email,
          userId: session?.user?.id
        })
        
        if (sessionError) {
          console.error('🔥 AUTH CALLBACK: Session error:', sessionError)
          setStatus('error')
          setTimeout(() => navigate('/auth?error=session_failed'), 2000)
          return
        }

        if (session) {
          console.log('✅ AUTH CALLBACK: Authentication successful:', session.user.email)
          
          // Check if this is a new user (account creation) or returning user (sign in)
          const userCreatedAt = new Date(session.user.created_at)
          const now = new Date()
          const isNewAccount = (now.getTime() - userCreatedAt.getTime()) < 60000 // 1 minute
          
          console.log('🔥 AUTH CALLBACK: User created at:', userCreatedAt)
          console.log('🔥 AUTH CALLBACK: Is new user:', isNewAccount)
          
          setIsNewUser(isNewAccount)
          setStatus('success')
          setTimeout(() => navigate('/dashboard'), 1000)
        } else {
          console.log('❌ AUTH CALLBACK: No session found after OAuth')
          setStatus('error')
          setTimeout(() => navigate('/auth?error=no_session'), 2000)
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