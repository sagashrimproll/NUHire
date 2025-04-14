/** @type {import('tailwindcss').Config} */


module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#D3DADC",
        foreground: "#E8E2DA",
        springWater: "#D3DADC",
        sand: "#E8E2DA",
        wood: "#D6C9B4",
        navy: "#455763",
        navyHeader: "#19242e",
      },
      fontFamily: {
        rubik: ["Rubik", "sans-serif"]
      }

    },
  },
  plugins: [],
}