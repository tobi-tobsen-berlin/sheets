import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    hmr: {
      host: 'znzv5l-3000.csb.app',
      clientPort: 443,
      protocol: 'wss'
    }
  }
});
