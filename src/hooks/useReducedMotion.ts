/**
 * Respect de prefers-reduced-motion.
 * Les transitions sont deja neutralisees en CSS ; ce hook sert aux animations
 * qui ne peuvent pas l'etre, en particulier le dessin image par image du
 * canvas de l'intro, qui saute alors directement a son etat final.
 */

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduit, setReduit] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const surChangement = () => setReduit(mq.matches);
    mq.addEventListener('change', surChangement);
    return () => mq.removeEventListener('change', surChangement);
  }, []);

  return reduit;
}
