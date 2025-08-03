import React from 'react'
import { cn } from '../../lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'hover' | 'interactive' | 'brutalist' | 'brutalist-hover'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function GlassCard({ 
  children, 
  className, 
  variant = 'default',
  blur = 'md',
  ...props 
}: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }

  const variantClasses = {
    default: 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10',
    hover: 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300',
    interactive: 'bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:border-white/30 dark:hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer',
    brutalist: 'bg-brutalist-white dark:bg-brutalist-dark-gray border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white',
    'brutalist-hover': 'bg-brutalist-white dark:bg-brutalist-dark-gray border-2 border-brutalist-black dark:border-brutalist-white shadow-brutalist dark:shadow-brutalist-white hover:shadow-brutalist-hover dark:hover:shadow-brutalist-white-hover hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 cursor-pointer'
  }

  const isBrutalist = variant === 'brutalist' || variant === 'brutalist-hover'
  
  return (
    <div
      className={cn(
        isBrutalist ? 'rounded-brutalist' : 'border rounded-3xl',
        !isBrutalist && blurClasses[blur],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}