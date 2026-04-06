/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0f1c',
        'bg-secondary': '#111827',
        'bg-card': '#1a2234',
        'fg-primary': '#f8fafc',
        'fg-secondary': '#94a3b8',
        'fg-muted': '#64748b',
        'border-custom': '#2d3748',
      },
      fontFamily: {
        'grotesk': ['"Space Grotesk"', 'sans-serif'],
        'inter': ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
