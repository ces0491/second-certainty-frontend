// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        "sc-green": {
          DEFAULT: "#006837",
          "50": "#E6F5EE",
          "100": "#C0E9D5",
          "200": "#80D4AB",
          "300": "#40BF82",
          "400": "#1AA158",
          "500": "#006837",
          "600": "#005D32",
          "700": "#00522D",
          "800": "#004727",
          "900": "#003C22",
        },
        "sc-gold": {
          DEFAULT: "#F7B917",
          "50": "#FEF6E2",
          "100": "#FDEDC5",
          "200": "#FBDB8B",
          "300": "#F9C952",
          "400": "#F7B917",
          "500": "#D69B08",
          "600": "#B07F07",
          "700": "#8B6405",
          "800": "#654804",
          "900": "#402C02",
        },
        "sc-black": "#231F20",
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}