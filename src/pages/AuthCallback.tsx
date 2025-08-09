import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Auth callback started')
        
        // Check URL for auth parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        
        console.log('📋 URL params:', { hasCode: !!code, error })

        if (error) {
          console.error('❌ OAuth error:', error)
          setStatus('error')
          setMessage('Authentication failed')
          setTimeout(() => navigate('/auth?error=oauth_error'), 2000)
          return
        }

        if (!code) {
          console.log('⚠️ No OAuth code found, redirecting...')
          navigate('/auth')
          return
        }

        console.log('🔄 Exchanging code for session...')
        setMessage('Completing authentication...')

        // Exchange code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('❌ Code exchange error:', exchangeError)
          setStatus('error')
          setMessage('Authentication failed')
          setTimeout(() => navigate('/auth?error=exchange_failed'), 2000)
          return
        }

        if (data.session) {
          console.log('✅ Authentication successful!')
          setStatus('success')
          
          // Check if new user
          const isNewUser = new Date().getTime() - new Date(data.session.user.created_at).getTime() < 60000
          setMessage(isNewUser ? 'Account created successfully!' : 'Welcome back!')
          
          // Redirect to dashboard
          setTimeout(() => navigate('/dashboard'), 1500)
        } else {
          console.error('❌ No session received')
          setStatus('error')
          setMessage('Authentication incomplete')
          setTimeout(() => navigate('/auth?error=no_session'), 2000)
        }

      } catch (error) {
        console.error('❌ Callback error:', error)
        setStatus('error')
        setMessage('Something went wrong')
        setTimeout(() => navigate('/auth?error=callback_error'), 2000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-electric-400'
      case 'error': return 'text-red-400'
      default: return 'text-electric-500'
    }
  }

  const getStatusIcon = () => {
    if (status === 'error') {
      return <div className="w-32 h-32 bg-red-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto flex items-center justify-center mb-8">
        <span className="text-6xl">❌</span>
      </div>
    }
    
    if (status === 'success') {
      return <div className="w-32 h-32 bg-electric-400 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto flex items-center justify-center mb-8">
        <span className="text-6xl">✅</span>
      </div>
    }

    return <div className="w-32 h-32 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal mx-auto flex items-center justify-center animate-spin mb-8">
      <Zap className="h-16 w-16 text-brutalist-black" />
    </div>
  }

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center">
      <div className="text-center">
        <div className="brutal-card p-12 mb-8 electric-pulse">
          {getStatusIcon()}

          <div className="text-4xl font-black text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-widest">
            {status === 'processing' && 'PROCESSING'}
            {status === 'success' && 'SUCCESS'}
            {status === 'error' && 'ERROR'}
          </div>
          
          <div className={`text-lg font-bold uppercase tracking-wider ${getStatusColor()}`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}