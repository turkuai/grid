import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TaiGrid',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tanstack/react-table',
        '@yudiel/react-qr-scanner',
        'lucide-react',
        'react-router-dom',
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})