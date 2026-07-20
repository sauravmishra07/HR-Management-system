/** @type {import('tailwindcss').Config} */
// Design tokens mirror the RAMP reference (light, blue-only palette).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2F6FC',
        card: '#FFFFFF',
        ink: {
          DEFAULT: '#102A4D',
          2: '#5B77A0',
          3: '#8AA2C4',
        },
        line: {
          DEFAULT: '#DEE8F6',
          2: '#CBDCF3',
        },
        blue: {
          DEFAULT: '#1465E0',
          deep: '#0A3D91',
          ink: '#0E4FB5',
        },
        sky: {
          DEFAULT: '#E7F0FE',
          2: '#CFE2FC',
          3: '#F5F9FF',
        },
        slate: {
          DEFAULT: '#7E96BB',
          bg: '#EDF2F9',
        },
      },
      fontFamily: {
        ui: ['"Roboto Slab"', 'Georgia', '"Times New Roman"', 'serif'],
        disp: ['"Roboto Slab"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Roboto Slab"', 'Georgia', 'serif'],
        serif: ['"Roboto Slab"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        r: '14px',
        'r-sm': '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,77,.05)',
        lift: '0 10px 30px -12px rgba(10,61,145,.25)',
        modal: '0 30px 80px -20px rgba(10,61,145,.45)',
      },
      keyframes: {
        pop: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        viewIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        modalIn: {
          from: { opacity: '0', transform: 'translateY(14px) scale(.98)' },
          to: { opacity: '1', transform: 'none' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        pop: 'pop .18s ease',
        viewIn: 'viewIn .22s ease',
        modalIn: 'modalIn .22s ease',
        toastIn: 'toastIn .25s ease',
      },
    },
  },
  plugins: [],
};
