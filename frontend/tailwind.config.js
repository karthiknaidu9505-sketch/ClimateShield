/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#006a3b",
        "on-primary": "#ffffff",
        "primary-container": "#268451",
        "on-primary-container": "#f6fff4",
        "primary-fixed": "#9af6b8",
        "primary-fixed-dim": "#7ed99e",

        "secondary": "#3f6656",
        "on-secondary": "#ffffff",
        "secondary-container": "#bee9d4",
        "on-secondary-container": "#436a5a",
        "secondary-fixed": "#c1ecd7",
        "secondary-fixed-dim": "#a5d0bc",

        "tertiary": "#7b5500",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#9b6b00",
        "on-tertiary-container": "#fffbff",
        "tertiary-fixed": "#ffdead",
        "tertiary-fixed-dim": "#fabc4d",
        "on-tertiary-fixed": "#281900",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        "background": "#eefdf3",
        "on-background": "#111e18",
        "surface": "#eefdf3",
        "surface-bright": "#eefdf3",
        "surface-dim": "#ceded4",
        "surface-variant": "#d7e6dc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#e8f7ed",
        "surface-container": "#e2f2e7",
        "surface-container-high": "#dcece2",
        "surface-container-highest": "#d7e6dc",

        "on-surface": "#111e18",
        "on-surface-variant": "#3f4941",
        "outline": "#6f7a70",
        "outline-variant": "#becabe",
        "inverse-surface": "#26332d",
        "inverse-on-surface": "#e5f5ea",
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Geist"', 'sans-serif'],
        mono: ['monospace'],
      },
      spacing: {
        'space-3xs': '0.125rem',
        'space-2xs': '0.25rem',
        'space-xs': '0.5rem',
        'space-sm': '0.75rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        'space-2xl': '3rem',
        'space-3xl': '4rem',
        'margin-desktop': '2rem',
        'margin-mobile': '1rem',
        'gutter-desktop': '1.5rem',
        'gutter-mobile': '1rem',
      }
    },
  },
  plugins: [],
}
