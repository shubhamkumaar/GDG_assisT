import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'TS2503') return; // Ignore "Cannot find namespace" errors
        defaultHandler(warning);
      },
    },
  },
})
