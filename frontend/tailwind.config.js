import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'Times New Roman', 'serif'],
        lora: ['Lora', 'Georgia', 'serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))'
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))'
        },
        // Semantic earthy palette
        terracotta: {
          50:  'oklch(0.95 0.04 38)',
          100: 'oklch(0.90 0.07 38)',
          200: 'oklch(0.82 0.10 38)',
          300: 'oklch(0.72 0.12 38)',
          400: 'oklch(0.62 0.14 38)',
          500: 'oklch(0.52 0.14 38)',
          600: 'oklch(0.44 0.13 38)',
          700: 'oklch(0.36 0.11 38)',
          800: 'oklch(0.28 0.08 38)',
          900: 'oklch(0.20 0.05 38)',
        },
        amber: {
          50:  'oklch(0.97 0.03 85)',
          100: 'oklch(0.93 0.06 82)',
          200: 'oklch(0.88 0.09 80)',
          300: 'oklch(0.82 0.11 78)',
          400: 'oklch(0.78 0.12 75)',
          500: 'oklch(0.72 0.13 72)',
          600: 'oklch(0.64 0.12 68)',
          700: 'oklch(0.54 0.10 62)',
          800: 'oklch(0.42 0.08 55)',
          900: 'oklch(0.30 0.06 48)',
        },
        forest: {
          50:  'oklch(0.95 0.03 145)',
          100: 'oklch(0.88 0.05 145)',
          200: 'oklch(0.78 0.07 145)',
          300: 'oklch(0.65 0.09 145)',
          400: 'oklch(0.52 0.10 145)',
          500: 'oklch(0.42 0.10 145)',
          600: 'oklch(0.35 0.09 145)',
          700: 'oklch(0.28 0.07 145)',
          800: 'oklch(0.22 0.05 145)',
          900: 'oklch(0.16 0.03 145)',
        },
        parchment: {
          50:  'oklch(0.98 0.01 85)',
          100: 'oklch(0.95 0.02 85)',
          200: 'oklch(0.92 0.04 85)',
          300: 'oklch(0.88 0.05 80)',
          400: 'oklch(0.82 0.06 78)',
          500: 'oklch(0.75 0.07 75)',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
        parchment: '0 2px 8px rgba(100,60,20,0.15), inset 0 1px 0 rgba(255,220,150,0.3)',
        wood: '0 4px 12px rgba(80,40,10,0.25)',
        glow: '0 0 12px rgba(180,100,40,0.4)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'key-press': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(2px)' },
          '100%': { transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'key-press': 'key-press 0.1s ease-in-out'
      }
    }
  },
  plugins: [typography, containerQueries, animate]
};
