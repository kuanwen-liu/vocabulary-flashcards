/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',
          card: '#1a1f35',
          border: '#2a3150',
        },
        accent: {
          primary: '#6366f1',
          secondary: '#ec4899',
          success: '#10b981',
          warning: '#f59e0b',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
