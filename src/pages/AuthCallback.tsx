import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  // Temporary placeholder - will rebuild properly
  React.useEffect(() => {
    console.log('Auth callback - redirecting to auth page')
    navigate('/auth')
  }, [navigate])

  return (
    <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk flex items-center justify-center">
      <div className="brutal-card p-12 mb-8">
        <div className="text-center">
          <div className="text-lg text-electric-500 font-bold uppercase tracking-wider">
            REDIRECTING...
          </div>
        </div>
      </div>
    </div>
  )
}