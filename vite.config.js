import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '127.0.0.1',
    allowedHosts: ['.trycloudflare.com'],
  },

  css: {
    // ADDED: enables CSS source maps in development mode
    devSourcemap: true,

    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'mixed-decls',
          'color-functions',
          'global-builtin',
          'import',
        ],
      },
    },
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
    // CHANGED: was false
    // enables JS source maps for debugging/build tracing
    // sourcemap: true,

    outDir: 'dist',

    manualChunks: {
      vendor: ['react-dom/client'],
    },
  },

  // FIXED: removed wrong nested optimizeDeps object
  optimizeDeps: {
    include: [],

    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})