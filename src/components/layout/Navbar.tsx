import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Zap, Plus, BarChart3, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import GlassCard from '../ui/GlassCard'
import GlassButton from '../ui/GlassButton'
import BrutalistThemeToggle from '../BrutalistThemeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { userProfile, signOut, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Create Proposal', href: '/create', icon: Plus },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleSignOut = async () => {
    try {
      console.log('🚨 Navbar: Starting sign out process...')
      console.log('🚨 Navbar: Current user before signout:', user?.email)
      
      // Close dropdown first
      setIsDropdownOpen(false)
      
      // Call signOut from AuthContext
      console.log('🚨 Navbar: Calling AuthContext.signOut()...')
      await signOut()
      
      console.log('✅ Navbar: SignOut completed, redirecting to home...')
      
      // Force navigation to home page
      navigate('/', { replace: true })
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        console.log('🔄 Navbar: Force reloading page for clean state...')
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Navbar: Sign out error details:', error)
      // Even if error, try to redirect anyway
      navigate('/', { replace: true })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <GlassCard className="mx-auto max-w-7xl px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-brutalist-black dark:text-white">Zapys AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-white/20 text-brutalist-black dark:text-white'
                      : 'text-brutalist-black dark:text-white/70 hover:text-brutalist-black dark:hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <BrutalistThemeToggle />
            
            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <GlassButton 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </GlassButton>
              
              {/* Dropdown with ULTRA HIGH Z-INDEX */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 z-[99999]" style={{zIndex: 99999}}>
                  <GlassCard className="p-2 space-y-1">
                    <div className="px-3 py-2 text-sm text-brutalist-black dark:text-white/90">
                      <p className="font-medium">{userProfile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-brutalist-black/60 dark:text-white/60 text-xs">{user?.email}</p>
                    </div>
                    <hr className="border-brutalist-black/20 dark:border-white/20" />
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-3 py-2 text-sm text-brutalist-black/70 dark:text-white/70 hover:text-brutalist-black dark:hover:text-white hover:bg-brutalist-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="border-brutalist-black/20 dark:border-white/20" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-3 py-2 text-sm text-brutalist-black/70 dark:text-white/70 hover:text-brutalist-black dark:hover:text-white hover:bg-brutalist-black/10 dark:hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </GlassCard>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </GlassButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/20">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-white/20 text-brutalist-black dark:text-white'
                        : 'text-brutalist-black dark:text-white/70 hover:text-brutalist-black dark:hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
              
              <hr className="border-white/20 my-3" />
              
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-brutalist-black dark:text-white/70">Theme</span>
                <BrutalistThemeToggle />
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-sm text-brutalist-black dark:text-white/70 hover:text-brutalist-black dark:hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </nav>
  )
}