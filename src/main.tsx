import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

/* Une ligne dans la console, pour pouvoir repondre a « quelle version est en
   ligne ? » sans avoir a deviner. Un hebergeur qui sert un ancien deploiement
   et un navigateur qui sert son cache ont le meme symptome. */
console.info(
  `Le port Dakhla Atlantique — version ${__VERSION__}, construite le ${__CONSTRUIT_LE__}`,
);
document.documentElement.dataset.version = __VERSION__;

const racine = document.getElementById('racine');
if (!racine) throw new Error('Élément #racine introuvable');

createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
