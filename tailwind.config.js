/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        electric: {
          50: '#f0fff0',
          100: '#ccffcc',
          200: '#99ff99',
          300: '#66ff66',
          400: '#33ff33',
          500: '#00ff00',
          600: '#00cc00',
          700: '#009900',
          800: '#006600',
          900: '#003300',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
          'light-strong': 'rgba(255, 255, 255, 0.2)',
          'dark-strong': 'rgba(0, 0, 0, 0.2)',
        },
        brutalist: {
          black: '#000000',
          white: '#ffffff',
          gray: '#808080',
          'light-gray': '#f5f5f5',
          'dark-gray': '#1a1a1a',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glass-shine': 'glassShine 2s ease-in-out infinite',
        'brutalist-hover': 'brutalistHover 0.2s ease-out',
        'electric-pulse': 'electricPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glassShine: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        brutalistHover: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-4px, -4px)' },
        },
        electricPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 0, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0, 255, 0, 0)' },
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
        'brutalist': '0',
      },
      boxShadow: {
        'brutalist': '4px 4px 0px #000000',
        'brutalist-hover': '8px 8px 0px #000000',
        'brutalist-white': '4px 4px 0px #ffffff',
        'brutalist-white-hover': '8px 8px 0px #ffffff',
        'electric': '0 0 20px rgba(0, 255, 0, 0.5)',
        'electric-strong': '0 0 40px rgba(0, 255, 0, 0.8)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-strong': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      }
    },
  },
  plugins: [],
}