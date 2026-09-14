/** Plein ecran (touche F). Silencieux si le navigateur refuse. */

import { useCallback, useEffect, useState } from 'react';

export function usePleinEcran() {
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const surChangement = () => setActif(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', surChangement);
    return () => document.removeEventListener('fullscreenchange', surChangement);
  }, []);

  const basculer = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  }, []);

  return { actif, basculer };
}
