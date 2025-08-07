import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>(['Component loaded'])

  useEffect(() => {
    const addDebug = (msg: string) => {
      console.log('🔥 AUTH DEBUG:', msg)
      setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
    }

    addDebug('Auth callback started - SIMPLE APPROACH')
    addDebug(`URL: ${window.location.href}`)
    
    let hasRedirected = false
    let timeoutId: NodeJS.Timeout | null = null

    const redirectToDashboard = () => {
      if (hasRedirected) return
      hasRedirected = true
      addDebug('🎉 SUCCESS! Redirecting to dashboard!')
      setIsProcessing(false)
      // Wait 2 seconds to give AuthContext time to process the session and create user profile
      setTimeout(() => {
        // Add a flag to indicate this came from auth callback to prevent redirect loops
        navigate('/dashboard?from_auth=true', { replace: true, state: null })
      }, 2000)
    }

    const redirectToAuthWithError = (error: string) => {
      if (hasRedirected) return
      hasRedirected = true
      addDebug(`❌ FAILED! Redirecting to auth with error: ${error}`)
      navigate(`/auth?error=${encodeURIComponent(error)}`, { replace: true })
    }

    // Check for URL errors immediately
    const params = new URLSearchParams(window.location.search)
    const urlError = params.get('error')
    if (urlError) {
      addDebug(`URL error found: ${urlError}`)
      redirectToAuthWithError(urlError)
      return
    }

    const code = params.get('code')
    addDebug(`Auth code present: ${code ? 'YES' : 'NO'}`)

    if (!code) {
      addDebug('No auth code - redirecting to auth')
      redirectToAuthWithError('no_code')
      return
    }

    addDebug('Auth code detected - attempting manual code exchange...')

    // Manual OAuth code exchange attempt
    const exchangeCodeForSession = async () => {
      try {
        addDebug('🔄 Attempting to exchange OAuth code for session...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          addDebug(`❌ Code exchange error: ${error.message}`)
          return false
        }
        if (data?.session) {
          addDebug('✅ Successfully exchanged code for session!')
          return true
        }
        addDebug('⚠️ Code exchange returned no session')
        return false
      } catch (err) {
        addDebug(`❌ Code exchange failed: ${err}`)
        return false
      }
    }

    // Immediate session check function
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && !hasRedirected) {
          addDebug('✅ Found existing session immediately!')
          redirectToDashboard()
          return true
        } else if (error) {
          addDebug(`❌ Session check error: ${error.message}`)
        } else {
          addDebug('No session found yet, continuing with auth flow...')
        }
      } catch (err) {
        addDebug(`❌ Session check failed: ${err}`)
      }
      return false
    }

    // Try manual code exchange first, then check session
    const initializeAuth = async () => {
      await exchangeCodeForSession()
      await checkSession()
    }
    
    initializeAuth()

    // Periodic session checks every 2 seconds for OAuth flows (max 5 checks)
    let checkInterval: NodeJS.Timeout | null = null
    let checkCount = 0
    const maxChecks = 5
    addDebug('Starting periodic session checks every 2 seconds (max 5 checks)...')
    checkInterval = setInterval(async () => {
      if (hasRedirected) {
        if (checkInterval) clearInterval(checkInterval)
        return
      }
      
      checkCount++
      addDebug(`🔄 Periodic session check ${checkCount}/${maxChecks}...`)
      const found = await checkSession()
      if (found && checkInterval) {
        clearInterval(checkInterval)
      }
      
      if (checkCount >= maxChecks) {
        addDebug('🚨 Max periodic checks reached - stopping checks')
        if (checkInterval) clearInterval(checkInterval)
      }
    }, 2000)

    // Primary method: Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      addDebug(`🔔 Auth state change: ${event}`)
      addDebug(`🔔 Session exists: ${session ? 'YES' : 'NO'}`)
      
      if (event === 'SIGNED_IN' && session && !hasRedirected) {
        addDebug('✅ SIGNED_IN event received with session!')
        addDebug(`✅ User ID: ${session.user?.id}`)
        addDebug(`✅ User Email: ${session.user?.email}`)
        
        // Check if new user (created in last 30 seconds)
        const userCreatedAt = new Date(session.user?.created_at || '')
        const now = new Date()
        const isNewUser = (now.getTime() - userCreatedAt.getTime()) < 30000
        
        if (isNewUser) {
          addDebug('🆕 New user detected! First time sign-in.')
        } else {
          addDebug('👋 Returning user sign-in.')
        }
        
        redirectToDashboard()
        return
      }
      
      if (event === 'TOKEN_REFRESHED' && session && !hasRedirected) {
        addDebug('✅ TOKEN_REFRESHED event with session!')
        redirectToDashboard()
        return
      }
    })

    // Secondary method: More patient timeout fallback for OAuth flows
    addDebug('Setting up 10-second timeout fallback...')
    timeoutId = setTimeout(() => {
      if (!hasRedirected) {
        addDebug('⏰ 10 second timeout reached - checking session one more time...')
        // One final session check before giving up
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session) {
            addDebug('✅ Found session on final check!')
            redirectToDashboard()
          } else {
            addDebug('❌ No session found after 10 seconds - trying one last code exchange...')
            const exchangeSucceeded = await exchangeCodeForSession()
            if (exchangeSucceeded) {
              addDebug('✅ Final code exchange succeeded!')
              // Check session one more time
              const { data: { session: finalSession } } = await supabase.auth.getSession()
              if (finalSession) {
                redirectToDashboard()
              } else {
                addDebug('❌ Still no session after final exchange')
                redirectToAuthWithError('final_exchange_failed')
              }
            } else {
              addDebug('❌ Final code exchange failed - redirecting to auth')
              redirectToAuthWithError('timeout_no_session')
            }
          }
        })
      }
    }, 10000)

    // Cleanup
    return () => {
      addDebug('🧹 Cleanup called')
      subscription.unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Ultra-Brutal Geometric Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 border-8 border-electric-500 animate-pulse shadow-brutal"></div>
        <div className="absolute top-60 right-32 w-32 h-32 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-24 h-24 border-4 border-brutalist-black dark:border-brutalist-white animate-spin shadow-brutal" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-16 h-16 bg-brutalist-black dark:bg-brutalist-white animate-pulse shadow-brutal" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 left-1/2 w-20 h-20 border-6 border-electric-500 animate-ping shadow-brutal" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-40 left-1/4 w-28 h-28 bg-gradient-to-br from-electric-500 to-electric-400 animate-spin shadow-brutal-lg" style={{animationDuration: '4s', animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-32 right-40 w-36 h-36 border-8 border-electric-500 animate-pulse shadow-brutal" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="text-center">
          <div className="brutal-card p-12 mb-8 electric-pulse relative overflow-hidden">
            {/* Main Loading Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto flex items-center justify-center animate-spin relative overflow-hidden">
                <Zap className="h-16 w-16 text-brutalist-black relative z-10" />
                {/* Gradient overlay animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-400 to-transparent animate-pulse opacity-50"></div>
              </div>
              {/* Orbiting squares */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
                <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black shadow-brutal animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
                <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black shadow-brutal animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-8">
                <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black shadow-brutal animate-bounce" style={{animationDelay: '0.6s'}}></div>
              </div>
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-8">
                <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black shadow-brutal animate-bounce" style={{animationDelay: '0.8s'}}></div>
              </div>
            </div>

            <div className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-6 uppercase tracking-widest">
              {isProcessing ? 'COMPLETING SIGN IN' : 'SUCCESS!'}
            </div>
            <div className="text-xl text-electric-500 font-bold uppercase tracking-widest animate-pulse mb-4">
              {isProcessing ? 'PROCESSING YOUR BRUTAL AUTHENTICATION' : 'REDIRECTING TO DASHBOARD'}
            </div>
            

            {/* Progress bars */}
            <div className="mt-8 space-y-4">
              <div className="h-2 bg-brutalist-gray border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal">
                <div className="h-full bg-electric-500 animate-pulse" style={{width: isProcessing ? '60%' : '100%'}}></div>
              </div>
              {!isProcessing && (
                <div className="h-2 bg-brutalist-gray border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal">
                  <div className="h-full bg-electric-500 animate-pulse w-full"></div>
                </div>
              )}
            </div>

            {/* Electric border animation */}
            <div className="absolute inset-0 border-8 border-electric-500 opacity-0 hover:opacity-40 transition-opacity duration-500 pointer-events-none animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}