import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setTimeout(() => navigate('/auth?error=callback_failed'), 2000)
          return
        }

        if (session) {
          console.log('✅ Authentication successful:', session.user.email)
          setStatus('success')
          setTimeout(() => navigate('/dashboard'), 1000)
        } else {
          console.log('❌ No session found')
          setStatus('error')
          setTimeout(() => navigate('/auth?error=no_session'), 2000)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
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
            {status === 'processing' && 'SIGNING YOU IN...'}
            {status === 'success' && 'SUCCESS!'}
            {status === 'error' && 'SOMETHING WENT WRONG'}
          </div>
          
          <div className="text-lg text-electric-500 font-bold uppercase tracking-wider">
            {status === 'processing' && 'PLEASE WAIT'}
            {status === 'success' && 'REDIRECTING TO DASHBOARD'}
            {status === 'error' && 'REDIRECTING TO LOGIN'}
          </div>
        </div>
      </div>
    </div>
  )
}