import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { Buffer } from 'buffer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {

          // 1. Separar AmCharts (es lo más pesado)
          if (id.includes('@amcharts/amcharts5')) {
            return 'charts';
          }

          // 2. Separar todo lo relacionado con Tron y Crypto
          if (id.includes('tronweb') || id.includes('tronwallet') || id.includes('crypto-js')) {
            return 'web3-crypto';
          }

          if (id.includes('node_modules')) {
            // Cambiamos el nombre de 'vendor' a 'libs' para evitar conflictos
            return 'libs';
          }
        },
      }
    }
  },
  define: {
    global: {},
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
})
