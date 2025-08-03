import React from 'react'
import { cn } from '../../lib/utils'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'brutalist' | 'brutalist-electric'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

export default function GlassButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: GlassButtonProps) {
  const isBrutalist = variant === 'brutalist' || variant === 'brutalist-electric'
  
  const baseClasses = isBrutalist 
    ? 'inline-flex items-center justify-center font-bold font-space-grotesk uppercase tracking-wide transition-all duration-200 border-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
    : 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 backdrop-blur-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-500/30 hover:from-primary-600 hover:to-primary-700 hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25',
    secondary: 'bg-white/20 dark:bg-white/10 text-white border-white/30 dark:border-white/20 hover:bg-white/30 dark:hover:bg-white/20 hover:scale-105 active:scale-95',
    ghost: 'bg-transparent text-white border-transparent hover:bg-white/10 dark:hover:bg-white/5 hover:scale-105 active:scale-95',
    outline: 'bg-transparent text-white border-white/30 dark:border-white/20 hover:bg-white/10 dark:hover:bg-white/5 hover:border-white/50 dark:hover:border-white/30 hover:scale-105 active:scale-95',
    brutalist: 'bg-brutalist-white dark:bg-brutalist-dark-gray text-brutalist-black dark:text-brutalist-white border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white hover:shadow-brutalist-hover dark:hover:shadow-brutalist-white-hover hover:-translate-x-1 hover:-translate-y-1',
    'brutalist-electric': 'bg-electric-500 text-brutalist-black border-brutalist-black shadow-brutalist hover:shadow-brutalist-hover hover:-translate-x-1 hover:-translate-y-1 hover:bg-electric-400 animate-electric-pulse'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}