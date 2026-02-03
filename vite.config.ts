import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root,
  envDir: resolve(__dirname),  // Look for .env in project root, not in src/
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  base: '/SnipSnap/',
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
      }
    }
  }
})