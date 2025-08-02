import React from 'react'
import { cn } from '../../lib/utils'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export default function GlassInput({
  label,
  error,
  icon,
  fullWidth = false,
  className,
  ...props
}: GlassInputProps) {
  return (
    <div className={cn('space-y-1', fullWidth && 'w-full')}>
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-white/60">
              {icon}
            </div>
          </div>
        )}
        
        <input
          className={cn(
            'block w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/30 dark:border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300',
            icon && 'pl-10',
            error && 'border-red-400/50 focus:border-red-400/50 focus:ring-red-400/50',
            className
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}