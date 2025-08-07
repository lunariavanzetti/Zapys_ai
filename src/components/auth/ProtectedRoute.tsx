import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

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
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet />
}