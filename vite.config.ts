import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ThisDictation/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'process.env.VITE_DEEPGRAM_API_KEY': JSON.stringify(process.env.VITE_DEEPGRAM_API_KEY),
    'process.env.VITE_OCR_API_KEY': JSON.stringify(process.env.VITE_OCR_API_KEY)
  }
}); 