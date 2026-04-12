import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,  // raise warning threshold (kB) — app is intentionally large
    rollupOptions: {
      output: {
        // Split vendor libs into a separate chunk for better caching
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
