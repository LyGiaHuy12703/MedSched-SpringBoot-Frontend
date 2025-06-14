import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@auth': fileURLToPath(new URL('./src/views/auth', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/views/admin', import.meta.url)),
      '@users': fileURLToPath(new URL('./src/views/users', import.meta.url)),
      '@staff': fileURLToPath(new URL('./src/views/staff', import.meta.url)),
    },
  },
})
