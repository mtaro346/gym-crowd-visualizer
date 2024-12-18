import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'gym-bg': '#FFFFFF',  // 追加
        'gym-text': '#000000', // 追加
        primary: {
          DEFAULT: '#315a8d',
          light: '#6ab8dd',
          dark: '#003c7e',
        },
        secondary: {
          DEFAULT: '#909090',
          light: '#c0c0c0',
          dark: '#303030',
        },
        accent: {
          DEFAULT: '#ef4e3f',
          light: '#f69a91',
          dark: '#b23a2f',
        },
        lifefit: {
          blue: {
            100: '#e0f3fb',
            200: '#dbecf8',
            300: '#3c78aa',
            400: '#003c7e',
          },
          gray: {
            100: '#f0f0f0',
            200: '#c0c0c0',
            300: '#909090',
            400: '#606060',
            500: '#303030',
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('tailwind-scrollbar-hide')],
} satisfies Config;