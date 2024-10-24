/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/*.{html,js}",
    "./public/js/bestand.js",
    "./public/js/verbrauch.js",
    "./public/js/menüplan.js",
    "./public/js/einkaufsliste-provisorisch.js",
    "./public/js/einkaufsliste.js",
    "./public/js/inventarVerwaltung.js"

  ],
  theme: {
    extend: {
      colors: {
        c1: '#1A1A1A',
        c2: '#3D3D3D',
        c3: '#588157',
        c4: '#A3B18A',
        c5: '#DAD7CD'

      },
      height: {
        '2/3': '66.666667%'
      }
    }, 
  },
  plugins: [],
}

