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
    <div className="min-h-screen flex flex-col bg-brutalist-light-gray dark:bg-brutalist-dark-gray font-space-grotesk">
      {/* Navigation */}
      <nav className="p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-electric-500 border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white">
              <Zap className="h-6 w-6 text-brutalist-black" />
            </div>
            <span className="text-2xl font-bold text-brutalist-black dark:text-brutalist-white uppercase tracking-wide">ZAPYS AI</span>
          </Link>
          <BrutalistThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <GlassCard variant="brutalist" className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-brutalist-black dark:text-brutalist-white mb-4 uppercase tracking-tight">
                {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
              </h1>
              <p className="text-brutalist-gray dark:text-brutalist-gray font-medium uppercase tracking-wide">
                {isSignUp 
                  ? 'START CREATING WINNING PROPOSALS WITH AI' 
                  : 'SIGN IN TO YOUR ZAPYS AI ACCOUNT'
                }
              </p>
            </div>

            {/* Social Sign In */}
            <div className="space-y-3 mb-6">
              <GlassButton
                variant="brutalist"
                fullWidth
                onClick={handleGoogleSignIn}
                className="justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </GlassButton>

              <GlassButton
                variant="brutalist"
                fullWidth
                onClick={handleAppleSignIn}
                className="justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                CONTINUE WITH APPLE
              </GlassButton>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-brutalist-black dark:border-brutalist-white"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-gray font-bold uppercase tracking-wide">OR</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <GlassButton
                variant="brutalist-electric"
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
              >
                {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </GlassButton>
            </form>

            {/* Toggle Sign Up/In */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-brutalist-gray hover:text-brutalist-black dark:hover:text-brutalist-white transition-colors font-medium uppercase tracking-wide"
              >
                {isSignUp ? (
                  <>
                    ALREADY HAVE AN ACCOUNT?{' '}
                    <span className="text-electric-500 font-bold">SIGN IN</span>
                  </>
                ) : (
                  <>
                    DON'T HAVE AN ACCOUNT?{' '}
                    <span className="text-electric-500 font-bold">SIGN UP</span>
                  </>
                )}
              </button>
            </div>

            {/* Terms */}
            {isSignUp && (
              <p className="mt-4 text-xs text-brutalist-gray text-center font-medium uppercase tracking-wide">
                BY CREATING AN ACCOUNT, YOU AGREE TO OUR{' '}
                <a href="#" className="text-electric-500 hover:text-electric-400 font-bold">
                  TERMS OF SERVICE
                </a>{' '}
                AND{' '}
                <a href="#" className="text-electric-500 hover:text-electric-400 font-bold">
                  PRIVACY POLICY
                </a>
              </p>
            )}
          </GlassCard>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-brutalist-gray hover:text-brutalist-black dark:hover:text-brutalist-white transition-colors text-sm font-bold uppercase tracking-wide"
            >
              ← BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}