
# Jeu Dino Chrome — Paysages évolutifs

Recréation du jeu T-Rex de Chrome en React/Canvas, avec un paysage qui se transforme à chaque palier de score.

## Gameplay
- Dino qui court automatiquement de gauche à droite (parallaxe du décor).
- **Espace** / **flèche haut** / **tap** pour sauter, **flèche bas** pour s'accroupir.
- Obstacles : cactus (variés) au sol, oiseaux volants à différentes hauteurs.
- Vitesse qui augmente progressivement avec le score.
- Game Over à la collision, redémarrage avec Espace.
- HUD : score courant, meilleur score (localStorage), niveau actuel.

## Système de niveaux & paysages
Changement de biome tous les 200 points (transition fondu de couleurs sur ~2s) :

1. **Désert** (0–200) — sable beige, cactus, soleil
2. **Forêt** (200–400) — vert, arbres, fougères, oiseaux
3. **Montagne enneigée** (400–600) — blanc/gris, sapins, flocons
4. **Coucher de soleil** (600–800) — orange/rose, dunes, cactus silhouettes
5. **Nuit étoilée** (800–1000) — bleu nuit, étoiles, lune, obstacles en silhouette
6. **Espace / lunaire** (1000+) — noir, cratères, étoiles filantes, gravité légèrement réduite

Chaque biome définit : couleur de ciel (dégradé), couleur du sol, sprites d'obstacles, éléments de décor en arrière-plan (parallaxe à 2 vitesses), et palette du dino.

## Structure technique
- `src/routes/index.tsx` — page du jeu (remplace le placeholder), avec titre, instructions et `<GameCanvas />`.
- `src/components/DinoGame.tsx` — composant principal, gère canvas + boucle `requestAnimationFrame`.
- `src/game/engine.ts` — état du jeu, physique (saut/gravité), spawn d'obstacles, détection de collision.
- `src/game/biomes.ts` — définition des 6 biomes (couleurs, décor, obstacles).
- `src/game/render.ts` — fonctions de dessin canvas (dino, sol, parallaxe, obstacles, HUD).
- Tout dessiné en canvas 2D avec formes géométriques + dégradés (pas d'assets externes nécessaires), couleurs via tokens du design system étendus dans `src/styles.css` pour le HUD.
- Responsive : canvas qui s'adapte à la largeur, hauteur fixe ~200px.
- Métadonnées SEO dans la route (title, description).

## Hors scope
- Pas de multijoueur, pas de backend, pas de sons (peut être ajouté ensuite si souhaité).
