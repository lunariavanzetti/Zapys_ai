import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [waitTimeout, setWaitTimeout] = useState(false)

  // Show loading for a minimum time to prevent redirect loops during OAuth flows
  if (loading) {
    return (
      <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray flex items-center justify-center">
        <div className="brutal-card p-8 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="animate-spin w-12 h-12 border-4 border-electric-500 border-t-transparent"></div>
            <span className="text-2xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider">
              LOADING...
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    // Check if coming from auth callback to prevent redirect loops
    const urlParams = new URLSearchParams(location.search)
    const isFromAuth = urlParams.get('from_auth') === 'true'
    
    if (isFromAuth && !waitTimeout) {
      // Set a timeout to prevent infinite waiting
      setTimeout(() => setWaitTimeout(true), 8000) // 8 seconds total wait
      
      // If coming from auth callback but no user yet, show loading and wait
      return (
        <div className="min-h-screen bg-brutalist-light-gray dark:bg-brutalist-dark-gray flex items-center justify-center">
          <div className="brutal-card p-8 hover-lift">
            <div className="text-center">
              <div className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider mb-4">
                SETTING UP YOUR ACCOUNT...
              </div>
              <div className="text-lg text-electric-500 font-bold uppercase tracking-wider mb-6">
                FINALIZING YOUR BRUTAL EXPERIENCE
              </div>
              <div className="animate-spin w-12 h-12 border-4 border-electric-500 border-t-transparent mx-auto"></div>
            </div>
          </div>
        </div>
      )
    }
    
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet />
}