/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Escanea todos los archivos HTML y TS en src/
  ],
  theme: {
    extend: {
      colors: {
        'marino': '#004d40',  // Azul marino oscuro para header
        'melon': '#ff8a80',  // Melón/coral para footer
        'rosa': '#e91e63',   // Rosa para botones y acentos
        'celeste': '#80deea', // Celeste para links o acentos secundarios
        'fondo': '#f5f5f5',  // Un blanco hueso para el body
      }
    },
  },
  plugins: [],
}
