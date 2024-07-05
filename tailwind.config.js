/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
	"./**/*.html",
	"./catalog/index.html",
  ],
  theme: {
    extend: {
		backgroundImage: {
			"main-bg": "url('/images/main-bg.webp')"
		},
		colors: {
			brand: "#BD0E1B"
		}
	},
  },
  plugins: [],
}

