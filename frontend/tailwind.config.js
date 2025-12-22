/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blend: {
          DEFAULT: '#2f657f', // Il Petrolio Blend
          dark: '#1e4659',
          light: '#4a8fa3',
          bg: '#f4f4f4' // Un bianco sporco per ridurre l'affaticamento occhi (stile agency)
        }
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'huge': '10rem', // Per titoloni stile Nooo
      }
    },
  },
  plugins: [],
}