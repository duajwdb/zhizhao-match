/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: {
          900: '#0A0F1A',
          800: '#0F1B2D',
          700: '#152238',
          600: '#1A2D4A',
        },
        tech: {
          500: '#1A73E8',
          400: '#3B8CEE',
          300: '#5DA3F2',
          200: '#8DBFF7',
        },
        teal: {
          500: '#00B4D8',
          400: '#25C9E6',
          300: '#48D8F0',
        },
        gold: {
          500: '#F0A500',
          400: '#FFB830',
          300: '#FFC85C',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          dark: '#E2E8F0',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(26,115,232,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(26,115,232,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'dot-pattern': 'radial-gradient(circle, rgba(26,115,232,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot': '24px 24px',
      },
    },
  },
  plugins: [],
}