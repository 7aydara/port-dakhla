import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Empreinte de la version, figee a la compilation.
 *
 * Sans elle, impossible de savoir quelle version est reellement en ligne :
 * un hebergeur qui sert un ancien deploiement et un navigateur qui sert son
 * cache donnent exactement le meme symptome — « rien n'a change » — et on
 * cherche le bug au mauvais endroit.
 *
 * Aucune requete reseau : c'est une constante remplacee a la compilation.
 */
function empreinte(): string {
  // Vercel et Netlify exposent le commit dans l'environnement du build.
  const depuisHebergeur =
    process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.COMMIT_REF ?? '';
  if (depuisHebergeur) return depuisHebergeur.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(empreinte()),
    __CONSTRUIT_LE__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
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
