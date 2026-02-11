import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1"
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
      },
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /.*\.jsx?$/,
    exclude: [],
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
    manualChunks: {
      vendor: ['react-dom/client'],
    },
  },
  optimizeDeps: {
    optimizeDeps: {
      include: [],
    },
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
