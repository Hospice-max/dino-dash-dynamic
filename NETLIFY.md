# Déployer sur Netlify

Le jeu est 100 % côté client, donc un déploiement statique suffit.

## Étapes

1. Cliquez sur **GitHub → Connect to GitHub** dans Lovable pour pousser le repo.
2. Sur [netlify.com](https://app.netlify.com) → **Add new site → Import from Git**.
3. Sélectionnez le repo. Netlify lira `netlify.toml` :
   - Build command : `bun run build`
   - Publish directory : `dist/client`
4. Cliquez **Deploy**.

## Notes

- Le projet est aujourd'hui configuré pour Cloudflare Workers (SSR). Sur Netlify
  on sert uniquement le bundle client (le jeu n'a pas besoin du serveur).
- Si vous ajoutez plus tard des server functions, il faudra installer
  l'adaptateur Netlify de TanStack Start et adapter `vite.config.ts`.
- Alternative la plus simple : utilisez le bouton **Publish** de Lovable pour
  obtenir une URL `.lovable.app` immédiate sans configuration.
