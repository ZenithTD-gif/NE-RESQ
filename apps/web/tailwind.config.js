/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#EBF3FA', // Serene Apple Light Blue
        backgroundAlt: '#F0F6FC',
        surface: '#FFFFFF',    // Crisp Translucent Ice Glass
        surfaceLight: '#F1F7FC',
        charcoal: {
          DEFAULT: '#0F172A', // Deep Slate Navy for high contrast on light blue
          light: '#334155',
          muted: '#64748B',
          dark: '#020617',
        },
        emergency: {
          DEFAULT: '#E94B55', // Vibrant Coral Red
          dark: '#B91C1C',
          light: '#FEECEE',
          glow: 'rgba(233, 75, 85, 0.35)',
        },
        emerald: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#ECFDF5',
        },
        amber: {
          DEFAULT: '#D97706',
          dark: '#B45309',
          light: '#FFFBEB',
        },
        cyan: {
          DEFAULT: '#0284C7',
          dark: '#0369A1',
          light: '#E0F2FE',
        },
        sky: {
          DEFAULT: '#0EA5E9',
          light: '#BAE6FD',
          dark: '#0369A1',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        deep: '24px',
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(15, 23, 42, 0.05), 0 1px 0 0 rgba(255, 255, 255, 0.9) inset',
        'glass-md': '0 12px 32px 0 rgba(15, 23, 42, 0.07), 0 0 15px -3px rgba(2, 132, 199, 0.08), 0 1px 0 0 rgba(255, 255, 255, 0.9) inset',
        'glass-lg': '0 20px 48px -8px rgba(15, 23, 42, 0.1), 0 0 24px -4px rgba(2, 132, 199, 0.12), 0 1px 0 0 rgba(255, 255, 255, 1) inset',
        'emergency-glow': '0 8px 25px -3px rgba(233, 75, 85, 0.4), 0 2px 6px 0 rgba(233, 75, 85, 0.2)',
        'cyan-glow': '0 8px 25px -3px rgba(2, 132, 199, 0.35), 0 2px 6px 0 rgba(2, 132, 199, 0.2)',
        'emerald-glow': '0 8px 25px -3px rgba(5, 150, 105, 0.35), 0 2px 6px 0 rgba(5, 150, 105, 0.2)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
    },
  },
  plugins: [],
};
