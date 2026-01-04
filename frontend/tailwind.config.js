/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#0B0F14',
        card: '#111827',
        surface: '#1F2933',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        accent: '#22D3EE',
        'accent-hover': '#06B6D4',
        'accent-soft': '#0E7490',
        success: '#10B981',
        info: '#38BDF8',
        warning: '#F59E0B',
        danger: '#EF4444',
        'border-subtle': '#1F2937',
        'border-active': '#22D3EE',
        'message-own': '#164E63',
        'message-other': '#1F2937',
      },
    },
  },
  plugins: [],
};
