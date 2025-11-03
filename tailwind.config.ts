import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: false, // 🚫 Отключает тёмную тему полностью
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],

}

export default config
