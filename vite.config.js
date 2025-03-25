import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "./", // Ensures relative paths for assets
  server: {
    https: true
  },
  build: {
    outDir: "dist", // Make sure Vite outputs to "dist"
    emptyOutDir: true, // Clears old builds before new ones
  }
})
