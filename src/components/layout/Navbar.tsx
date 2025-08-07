import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap, Plus, BarChart3, Settings, LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import BrutalistThemeToggle from '../BrutalistThemeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { userProfile, signOut, user } = useAuth()
  const location = useLocation()
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
      await signOut()
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="brutal-card mx-auto max-w-7xl px-8 py-4 hover-lift">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-electric-500 border-4 border-brutalist-black dark:border-brutalist-white shadow-brutal hover:animate-spin">
              <Zap className="h-8 w-8 text-brutalist-black" />
            </div>
            <span className="text-4xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">ZAPYS AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-6 py-4 border-2 font-black uppercase tracking-wider text-sm transition-all duration-300 hover-lift ${
                    isActive(item.href)
                      ? 'bg-electric-500 text-brutalist-black border-brutalist-black dark:border-brutalist-white shadow-brutal'
                      : 'bg-brutalist-white dark:bg-brutalist-black text-brutalist-black dark:text-brutalist-white border-brutalist-black dark:border-brutalist-white hover:bg-electric-500 hover:text-brutalist-black shadow-brutal'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <BrutalistThemeToggle />
            
            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-6 py-4 bg-brutalist-white dark:bg-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider text-sm transition-all duration-300 hover:bg-electric-500 hover:text-brutalist-black"
              >
                <div className="w-8 h-8 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal flex items-center justify-center">
                  <User className="h-4 w-4 text-brutalist-black" />
                </div>
                <span className="text-brutalist-black dark:text-brutalist-white">
                  {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'USER'}
                </span>
              </button>
              
              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 z-50">
                  <div className="brutal-card p-6 space-y-4 hover-lift">
                    <div className="px-4 py-3 border-2 border-brutalist-black dark:border-brutalist-white bg-electric-500 shadow-brutal">
                      <p className="font-black text-brutalist-black uppercase tracking-wider text-sm">
                        {userProfile?.full_name || user?.email?.split('@')[0] || 'USER'}
                      </p>
                      <p className="text-brutalist-black text-xs font-bold">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-3 bg-brutalist-white dark:bg-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift transition-all duration-300 hover:bg-electric-500 hover:text-brutalist-black font-black uppercase tracking-wider text-sm text-brutalist-black dark:text-brutalist-white"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      SETTINGS
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 bg-brutalist-white dark:bg-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift transition-all duration-300 hover:bg-electric-500 hover:text-brutalist-black font-black uppercase tracking-wider text-sm text-brutalist-black dark:text-brutalist-white"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      SIGN OUT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift"
            >
              {isOpen ? <X className="h-6 w-6 text-brutalist-black" /> : <Menu className="h-6 w-6 text-brutalist-black" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-6 pt-6 border-t-4 border-brutalist-black dark:border-brutalist-white">
            <div className="space-y-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-4 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift font-black uppercase tracking-wider text-sm transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-electric-500 text-brutalist-black'
                        : 'bg-brutalist-white dark:bg-brutalist-black text-brutalist-black dark:text-brutalist-white hover:bg-electric-500 hover:text-brutalist-black'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
              
              <div className="border-t-2 border-brutalist-black dark:border-brutalist-white pt-4 mt-4">
                <div className="flex items-center justify-between px-4 py-3 bg-brutalist-white dark:bg-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal mb-4">
                  <span className="font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-wider text-sm">THEME</span>
                  <BrutalistThemeToggle />
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-4 bg-brutalist-white dark:bg-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal hover-lift transition-all duration-300 hover:bg-electric-500 hover:text-brutalist-black font-black uppercase tracking-wider text-sm text-brutalist-black dark:text-brutalist-white"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  SIGN OUT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}