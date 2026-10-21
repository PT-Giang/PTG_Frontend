import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: 'localhost', port: 3000, strictPort: true, proxy: { '/api': 'http://localhost:8080' } },
  preview: { host: 'localhost', port: 3000, strictPort: true },
});
