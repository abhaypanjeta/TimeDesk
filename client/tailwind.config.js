/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6', // Blue 500
                secondary: '#64748b', // Slate 500
                accent: '#f43f5e', // Rose 500
                background: '#f1f5f9', // Slate 100
                surface: '#ffffff',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
