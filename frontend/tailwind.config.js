/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tsinghua-purple': '#5E2C91',
        'tsinghua-purple-dark': '#3D1C5F',
        'tsinghua-purple-light': '#7B4AA8',
        primary: {
          DEFAULT: '#5E2C91',
          dark: '#3D1C5F',
          light: '#7B4AA8',
          50: '#F5F0FA',
          100: '#EBE1F5',
          200: '#D7C3EB',
          300: '#B896D9',
          400: '#9569C7',
          500: '#5E2C91',
          600: '#491E6B',
          700: '#3D1C5F',
          800: '#2E1547',
          900: '#1F0E2F',
        },
        accent: '#1E4A9E',
        success: '#1F8A37',
        warning: '#E68900',
        danger: '#C82333',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'PingFang SC',
          'Microsoft YaHei',
          'Hiragino Sans GB',
          'sans-serif',
        ],
      },
      boxShadow: {
        'purple': '0 4px 12px rgba(94, 44, 145, 0.25)',
      },
    },
  },
  plugins: [],
};
