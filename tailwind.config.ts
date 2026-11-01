import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          charcoal: {
            DEFAULT: '#1A1A1A',
            50: '#F4F4F5',
            100: '#E4E4E7',
            200: '#A1A1AA',
            700: '#262626',
            800: '#1F1F1F',
            900: '#1A1A1A',
            950: '#121212',
          },
          fire: {
            DEFAULT: '#C2410C', // Accessible fire orange (4.8:1 on #FBF9F5)
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            500: '#EA580C',
            600: '#D9480F',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12',
          },
          gold: {
            DEFAULT: '#B45309', // Accessible warm gold on light backgrounds
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
          },
          offwhite: {
            DEFAULT: '#FBF9F5', // Warm appetizing off-white
            card: '#FFFFFF',
            subtle: '#F4EFE6',
            border: '#E8E2D8',
          },
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

export default config;

