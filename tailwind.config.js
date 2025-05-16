// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        "sc-green": "#006837", // Dark green from logo
        "sc-gold": "#F7B917",  // Gold/yellow from logo 
        "sc-black": "#231F20", // Black from logo
      }
    },
  },
  plugins: [],
}