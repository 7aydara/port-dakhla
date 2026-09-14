import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Chemins relatifs : le dossier dist/ peut etre servi depuis n'importe ou
  // (npx serve dist, une cle USB, un sous-dossier) sans reconfiguration.
  base: './',
  build: {
    // Tout est inline ou local. Aucune requete reseau au runtime.
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 800,
  },
});
