import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function BrutalistThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative bg-brutalist-white dark:bg-brutalist-black border-2 border-brutalist-black dark:border-brutalist-white p-3 shadow-brutalist dark:shadow-brutalist-white hover:shadow-brutalist-hover dark:hover:shadow-brutalist-white-hover transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {theme === 'light' ? (
          <Sun className="w-6 h-6 text-brutalist-black group-hover:text-electric-500 transition-colors duration-200" />
        ) : (
          <Moon className="w-6 h-6 text-brutalist-white group-hover:text-electric-500 transition-colors duration-200" />
        )}
      </div>
      
      {/* Electric glow effect */}
      <div className="absolute inset-0 bg-electric-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </button>
  )
}