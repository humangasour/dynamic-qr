import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, screens: { '2xl': '1280px' } },
    extend: {},
  },
} satisfies Config;
