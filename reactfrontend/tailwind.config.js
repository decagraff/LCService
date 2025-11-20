export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#2563eb',
        },
        background: {
          light: '#ffffff',
          'light-secondary': '#f8fafc',
          'light-tertiary': '#f1f5f9',
          dark: '#1B1C1D',
          'dark-secondary': '#111213',
          'dark-tertiary': '#2a2b2d',
        },
        text: {
          'light-primary': '#111827',
          'light-secondary': '#64748b',
          'dark-primary': '#f8fafc',
          'dark-secondary': '#94a3b8',
        },
        border: {
          light: '#e2e8f0',
          dark: '#374151',
        },
      },
    },
  },
  plugins: [],
}