import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import GlassButton from '../components/ui/GlassButton'
import GlassInput from '../components/ui/GlassInput'
import BrutalistThemeToggle from '../components/BrutalistThemeToggle'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })

  const { user, signIn, signUp, signInWithGoogle, signInWithApple } = useAuth()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/dashboard'

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName)
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Account created! Please check your email to verify your account.')
        }
      } else {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          toast.error(error.message)
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Failed to sign in with Google')
    }
  }

  const handleAppleSignIn = async () => {
    try {
      const { error } = await signInWithApple()
      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      toast.error('Failed to sign in with Apple')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk relative overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-electric-500 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-electric-500 shadow-brutal animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-brutalist-black dark:border-brutalist-white animate-spin" style={{animationDuration: '3s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-brutalist-black dark:bg-brutalist-white animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="p-6 relative z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-12 h-12 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutal group-hover:shadow-brutal-lg group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all duration-200">
              <Zap className="h-7 w-7 text-brutalist-black" />
            </div>
            <span className="text-3xl font-black text-brutalist-black dark:text-brutalist-white uppercase tracking-tight">ZAPYS AI</span>
          </Link>
          <BrutalistThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-lg">
          <div className="brutal-card p-10 hover-lift">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-block relative mb-6">
                <h1 className="text-brutal-hero text-brutalist-black dark:text-brutalist-white mb-2">
                  {isSignUp ? 'CREATE' : 'WELCOME'}
                </h1>
                <h1 className="text-brutal-hero text-electric-500 relative">
                  {isSignUp ? 'ACCOUNT' : 'BACK'}
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-electric-500 animate-pulse"></div>
                </h1>
              </div>
              <p className="text-lg text-brutalist-gray font-bold uppercase tracking-widest mb-8">
                {isSignUp 
                  ? 'JOIN THE FUTURE OF PROPOSAL GENERATION' 
                  : 'ACCESS YOUR BRUTAL WORKSPACE'
                }
              </p>
            </div>

            {/* Social Sign In */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleGoogleSignIn}
                className="btn-secondary hover-electric group relative overflow-hidden py-4 px-6"
              >
                <div className="flex items-center justify-center relative z-10">
                  <svg className="w-6 h-6 mr-3 group-hover:animate-spin" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-black tracking-wider">GOOGLE</span>
                </div>
              </button>

              <button
                onClick={handleAppleSignIn}
                className="btn-secondary hover-electric group relative overflow-hidden py-4 px-6"
              >
                <div className="flex items-center justify-center relative z-10">
                  <svg className="w-6 h-6 mr-3 group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="font-black tracking-wider">APPLE</span>
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-brutalist-black dark:border-brutalist-white opacity-20"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-electric-500 px-6 py-2 border-2 border-brutalist-black shadow-brutal">
                  <span className="text-brutalist-black font-black text-lg tracking-widest">OR</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <GlassInput
                  variant="brutalist"
                  label="FULL NAME"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  icon={<User className="h-4 w-4" />}
                  required
                  fullWidth
                />
              )}

              <GlassInput
                variant="brutalist"
                label="EMAIL"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                icon={<Mail className="h-4 w-4" />}
                required
                fullWidth
              />

              <GlassInput
                variant="brutalist"
                label="PASSWORD"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                icon={<Lock className="h-4 w-4" />}
                required
                fullWidth
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 px-8 text-xl relative overflow-hidden group electric-pulse"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-brutal mr-3"></div>
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">{isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
                    <div className="absolute inset-0 bg-electric-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up/In */}
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="group relative p-4 border-2 border-brutalist-black dark:border-brutalist-white hover:border-electric-500 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-sm font-bold uppercase tracking-wider text-brutalist-gray group-hover:text-brutalist-black dark:group-hover:text-brutalist-white">
                  {isSignUp ? 'ALREADY HAVE AN ACCOUNT?' : "DON'T HAVE AN ACCOUNT?"}
                </div>
                <div className="text-lg font-black uppercase tracking-widest text-electric-500 mt-1">
                  {isSignUp ? 'SIGN IN' : 'SIGN UP'}
                </div>
              </button>
            </div>

            {/* Terms */}
            {isSignUp && (
              <div className="mt-6 p-4 border-2 border-electric-500 bg-electric-500 bg-opacity-10">
                <p className="text-xs text-brutalist-black dark:text-brutalist-white text-center font-bold uppercase tracking-wide leading-relaxed">
                  BY CREATING AN ACCOUNT, YOU AGREE TO OUR{' '}
                  <a href="#" className="text-electric-500 hover:text-electric-400 font-black underline decoration-2 underline-offset-2">
                    TERMS OF SERVICE
                  </a>{' '}
                  AND{' '}
                  <a href="#" className="text-electric-500 hover:text-electric-400 font-black underline decoration-2 underline-offset-2">
                    PRIVACY POLICY
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="inline-block btn-secondary px-8 py-3 group"
            >
              <span className="flex items-center">
                <span className="mr-2 text-xl group-hover:animate-pulse">←</span>
                <span className="font-black tracking-widest">BACK TO HOME</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}