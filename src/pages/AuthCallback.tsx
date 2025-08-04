import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/auth?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard')
        } else {
          // No session found, redirect to auth page
          navigate('/auth')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        navigate('/auth?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-electric-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wide mb-2">
          COMPLETING SIGN IN...
        </h1>
        <p className="text-brutalist-gray font-medium">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  )
}