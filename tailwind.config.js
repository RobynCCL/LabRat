/** Colours map to CSS variables in src/styles/tokens.css so light/dark themes swap automatically. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        border: v('border'),
        ink: v('ink'),
        muted: v('muted'),
        primary: v('primary'),
        'primary-ink': v('primary-ink'),
        accent: v('accent'),
        good: v('good'),
        bad: v('bad'),
        warn: v('warn'),
        mole: v('mole'),
        common: v('r-common'),
        uncommon: v('r-uncommon'),
        rare: v('r-rare'),
        epic: v('r-epic'),
        legendary: v('r-legendary'),
      },
      fontFamily: {
        sans: ['Nunito Variable', 'Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Fredoka Variable', 'Fredoka', 'Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.06)',
        lift: '0 2px 4px rgb(0 0 0 / 0.08), 0 12px 28px rgb(0 0 0 / 0.10)',
        press: 'inset 0 -3px 0 rgb(0 0 0 / 0.18)',
      },
    },
  },
  plugins: [],
};
