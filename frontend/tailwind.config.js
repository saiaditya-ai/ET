/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        neon: {
          blue: '#00f0ff',
          cyan: '#00d9ff',
          purple: '#a855f7',
          pink: '#ec4899',
          green: '#10b981',
        },
      },
      backgroundColor: {
        'glass': 'rgba(15, 23, 42, 0.8)',
        'glass-light': 'rgba(30, 41, 59, 0.9)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-gentle': 'bounceGentle 1.5s ease-in-out infinite',
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
        'float-up': 'floatUp 3s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'tech-pulse': 'techPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'dna-rotate': 'dnaRotate 8s linear infinite',
        'quantum-fade': 'quantumFade 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0, 240, 255, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0, 240, 255, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        glow: {
          '0%, 100%': { textShadow: '0 0 10px rgba(0, 240, 255, 0.3)' },
          '50%': { textShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
        },
        techPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3), inset 0 0 5px rgba(0, 240, 255, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.2)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        dnaRotate: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        },
        quantumFade: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'glow-md': '0 0 30px rgba(0, 240, 255, 0.4)',
        'glow-lg': '0 0 50px rgba(0, 240, 255, 0.5)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.3)',
        'neon': '0 0 15px rgba(0, 240, 255, 0.5)',
        'hover': '0 20px 40px rgba(0, 240, 255, 0.2)',
      },
      borderColor: {
        'neon-cyan': 'rgba(0, 240, 255, 0.3)',
        'neon-glow': 'rgba(0, 240, 255, 0.5)',
      },
    },
  },
  plugins: [],
}

