import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Адрес сайта на GitHub Pages: https://arthur-jq.github.io/clining-spb/
  base: '/clining-spb/',
  plugins: [react(), tailwindcss()],
  server: { open: true },
  build: {
    rollupOptions: {
      output: {
        // Библиотеки отдельными файлами — браузер кеширует их между обновлениями сайта
        manualChunks: {
          map: ['leaflet'],
          charts: ['recharts'],
        },
      },
    },
  },
})
