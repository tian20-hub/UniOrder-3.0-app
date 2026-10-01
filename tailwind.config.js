/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e0edfe',
          200: '#bae0fd',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
