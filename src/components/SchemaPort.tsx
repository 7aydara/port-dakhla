/**
 * LE SCHEMA DU PORT -- piece maitresse du site.
 *
 * SVG ecrit a la main, en coordonnees propres (viewBox 1000 x 760), qui se
 * construit en six couches, une par appui.
 *
 * Ce n'est PAS une carte exacte et le schema le dit lui-meme : c'est un schema
 * de geographie, lisible et legende plutot que photorealiste. La geometrie est
 * decalquee des images aeriennes reelles du chantier -- digues en crochet
 * enfermant un plan d'eau, terre-plein gagne sur la mer, viaduc perpendiculaire
 * a la cote -- et non inventee.
 *
 * Les traces se dessinent par animation de stroke-dashoffset. On utilise
 * pathLength="1" : la longueur de chaque chemin est ainsi normalisee a 1, ce
 * qui evite d'avoir a mesurer les chemins en JavaScript.
 */

import { useEtape } from '../hooks/usePresentation';
import { etatCouche } from '../hooks/usePresentation';

/* --------------------------------------------------------------------------
   Geometrie. Ocean a l'ouest (gauche), terre a l'est (droite).
   -------------------------------------------------------------------------- */

const COTE = 'M 735,0 C 700,140 690,260 686,392 C 682,520 700,640 748,760';
const TERRE = `${COTE} L 1000,760 L 1000,0 Z`;

const ISOBATHES = [
  { d: 'M 640,0 C 610,150 600,270 596,392 C 592,520 610,640 655,760', cote: 5 },
  { d: 'M 520,0 C 495,150 487,270 484,392 C 481,520 496,640 536,760', cote: 10 },
  { d: 'M 395,0 C 372,150 365,270 362,392 C 359,520 372,640 408,760', cote: 16 },
  { d: 'M 265,0 C 245,150 239,270 236,392 C 233,520 244,640 276,760', cote: 20 },
] as const;

/* Sondes isolees, comme sur une carte marine : de petits nombres poses sur
   l'eau. Elles reprennent les paliers des isobathes, rien d'autre. */
const SONDES = [
  { x: 690, y: 96, v: 3 }, { x: 585, y: 210, v: 7 }, { x: 452, y: 120, v: 13 },
  { x: 320, y: 200, v: 18 }, { x: 168, y: 330, v: 24 }, { x: 178, y: 596, v: 23 },
  { x: 455, y: 690, v: 12 }, { x: 612, y: 470, v: 8 }, { x: 300, y: 430, v: 17 },
] as const;

const DIGUE_SUD = 'M 735,650 L 520,640 L 330,590 L 250,480 L 245,420';
const DIGUE_NORD = 'M 712,180 L 500,200 L 330,240 L 255,320 L 250,370';
const VIADUC = 'M 686,390 L 527,392';
const ILOT = 'M 330,300 L 520,292 L 535,515 L 322,525 Z';

const QUAIS = [
  { d: 'M 327,320 L 324,440', cle: 'commerce' },
  { d: 'M 323,520 L 533,512', cle: 'peche' },
  { d: 'M 450,295 L 520,293', cle: 'reparation' },
] as const;

const ZONE = 'M 772,168 L 980,150 L 980,648 L 790,636 Z';
const ROUTE = 'M 876,158 L 884,74 L 930,0';

interface ProprietesSchema {
  /** Index de la premiere couche, si le schema ne commence pas a l'etape 0. */
  readonly decalage?: number;
}

export function SchemaPort({ decalage = 0 }: ProprietesSchema) {
  const etape = useEtape();
  const couche = (n: number) => etatCouche(n + decalage, etape);

  return (
    <figure className="schema">
      <svg
        viewBox="0 0 1000 760"
        className="schema__svg"
        role="img"
        aria-labelledby="schema-titre schema-desc"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="schema-titre">
          Schéma de principe du site portuaire de Ntirift
        </title>
        <desc id="schema-desc">
          Vue de dessus. L’océan Atlantique est à gauche, la terre à droite. Le
          schéma se construit en six couches : les fonds marins et le trait de
          côte, les digues de protection, le viaduc maritime, le terre-plein et
          le port-îlot, les quais, puis la zone industrielle et logistique.
        </desc>

        <defs>
          {/* Trame du terre-plein : des hachures, pas un aplat -- on lit
              immediatement que c'est une surface construite. */}
          <pattern id="trame-remblai" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="var(--ocre)" strokeWidth="2.6" opacity="0.55" />
          </pattern>
          <pattern id="trame-zone" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 0,16 L 16,0" stroke="var(--ocre)" strokeWidth="1.1" opacity="0.4" />
            <path d="M 0,0 L 16,16" stroke="var(--ocre)" strokeWidth="1.1" opacity="0.2" />
          </pattern>
        </defs>

        {/* ---- COUCHE 1 : le trait de cote et les isobathes ---------------- */}
        <g data-etat={couche(0)}>
          {/* Bandes de profondeur, de la plus profonde a la plus faible. */}
          <g className="schema__bandes" aria-hidden="true">
            {/* Bandes de profondeur : plus c'est profond, plus le bleu est
                soutenu. Cinq paliers pastel, du large (à gauche) vers la côte. */}
            <rect x="0" y="0" width="1000" height="760" fill="#7fb6d4" />
            <path d={`${ISOBATHES[3].d} L 1000,760 L 1000,0 Z`} fill="#94c4dd" />
            <path d={`${ISOBATHES[2].d} L 1000,760 L 1000,0 Z`} fill="#a9cfe4" />
            <path d={`${ISOBATHES[1].d} L 1000,760 L 1000,0 Z`} fill="#c2deec" />
            <path d={`${ISOBATHES[0].d} L 1000,760 L 1000,0 Z`} fill="#dcedf5" />
          </g>

          <path d={TERRE} className="schema__terre" />

          {ISOBATHES.map((iso) => (
            <g key={iso.cote}>
              <path d={iso.d} className="schema__isobathe" data-anime="" pathLength={1} />
            </g>
          ))}

          {/* Etiquettes de profondeur, posees sur leur isobathe. */}
          {ISOBATHES.map((iso, i) => (
            <text
              key={`l${iso.cote}`}
              /* Posees sous le trace de la digue sud, dans l'eau degagee :
                 au-dessus, la digue les recouvrait. */
              x={[637, 519, 391, 261][i]}
              y={700}
              className="schema__cote-isobathe"
              textAnchor="middle"
            >
              −{iso.cote} m
            </text>
          ))}

          {SONDES.map((s) => (
            <text key={`${s.x}-${s.y}`} x={s.x} y={s.y} className="schema__sonde" textAnchor="middle">
              {s.v}
            </text>
          ))}

          <path d={COTE} className="schema__trait-cote" data-anime="" pathLength={1} />
          <text x={880} y={724} className="schema__toponyme" textAnchor="middle">
            CÔTE ATLANTIQUE
          </text>
          <text x={120} y={724} className="schema__toponyme schema__toponyme--mer" textAnchor="middle">
            OCÉAN ATLANTIQUE
          </text>
        </g>

        {/* ---- COUCHE 2 : les digues de protection ------------------------ */}
        <g data-etat={couche(1)}>
          <path d={DIGUE_SUD} className="schema__digue" data-anime="" pathLength={1} />
          <path d={DIGUE_NORD} className="schema__digue" data-anime="" pathLength={1} />
          {/* La passe d'entree : ce n'est pas un trou dans le dessin. */}
          <path d="M 245,420 L 250,370" className="schema__passe" data-anime="" pathLength={1} />
          <text x={196} y={398} className="schema__etiquette" textAnchor="middle">
            passe
          </text>
        </g>

        {/* ---- COUCHE 3 : le viaduc maritime ------------------------------ */}
        <g data-etat={couche(2)}>
          <path d={VIADUC} className="schema__viaduc" data-anime="" pathLength={1} />
          {/* Les piles, qui disent que l'ouvrage est sur pilotis. */}
          {[660, 630, 600, 570, 540].map((x) => (
            <line key={x} x1={x} y1={380} x2={x} y2={402} className="schema__pile" />
          ))}
        </g>

        {/* ---- COUCHE 4 : le terre-plein et le port-ilot ------------------ */}
        <g data-etat={couche(3)}>
          <path d={ILOT} className="schema__ilot" data-anime="" pathLength={1} />
          <text x={428} y={416} className="schema__etiquette schema__etiquette--terre" textAnchor="middle">
            PORT-ÎLOT
          </text>
        </g>

        {/* ---- COUCHE 5 : les quais --------------------------------------- */}
        <g data-etat={couche(4)}>
          {QUAIS.map((q) => (
            <path key={q.cle} d={q.d} className={`schema__quai schema__quai--${q.cle}`} data-anime="" pathLength={1} />
          ))}
        </g>

        {/* ---- COUCHE 6 : la zone industrielle et logistique --------------- */}
        <g data-etat={couche(5)}>
          <path d={ZONE} className="schema__zone" data-anime="" pathLength={1} />
          <path d={ROUTE} className="schema__route" data-anime="" pathLength={1} />
          <text x={876} y={404} className="schema__etiquette schema__etiquette--terre" textAnchor="middle">
            ZONE
          </text>
          <text x={876} y={428} className="schema__etiquette schema__etiquette--terre" textAnchor="middle">
            INDUSTRIELLE
          </text>
          <text x={952} y={40} className="schema__etiquette schema__etiquette--terre" textAnchor="end">
            vers RN 1
          </text>
        </g>

        {/* ---- Rose des vents. Toujours visible : on lit une carte. -------- */}
        <g className="schema__nord" aria-hidden="true" transform="translate(62, 74)">
          <path d="M 0,-30 L 8,10 L 0,3 L -8,10 Z" className="schema__nord-aiguille" />
          <text x="0" y="30" textAnchor="middle" className="schema__nord-lettre">N</text>
        </g>
      </svg>

      <figcaption className="schema__legende-figure">
        Schéma de principe, non à l’échelle. Géométrie décalquée des vues
        aériennes du chantier ; les profondeurs et les longueurs sont celles du
        dossier, leur position relative est simplifiée.
      </figcaption>
    </figure>
  );
}
