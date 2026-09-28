import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // One server hosts every site. The hostname is what selects one, so
  // localhost:3000 is the website and watchtower.localhost:3000 is Watch Tower.
  // Any *.localhost name is accepted by Vite without configuration; the entry
  // below additionally allows a hosts file entry for the real product domain,
  // so testing against the production hostname also needs no extra setup.
  server: {
    port: 3000,
    open: true,
    allowedHosts: ['.enmero.in']
  },
  preview: {
    allowedHosts: ['.enmero.in']
  }
});
