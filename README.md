# Roshan Mahashabde: portfolio

Four discs (About, Projects, Experience, Research) rendered in 3D with Three.js, animated with GSAP (ScrollTrigger, ScrambleText, SplitText), built with Vite.

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173).

## Edit the content

Everything you would want to change lives in `src/content.js`: names, credits, highlights, projects, roles, papers and links. The disc artwork is drawn in code in `src/discArt.js`, so there are no images to manage. Your CV is `public/Roshan-Mahashabde-CV.pdf`; replace that file to update it.

## Deploy to Vercel

1. Create a new GitHub repository (for example `portfolio`) and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/RoshanBM/portfolio.git
   git push -u origin main
   ```
2. Go to vercel.com, sign in with GitHub, choose **Add New > Project** and import the repository.
3. Vercel detects Vite automatically (build command `npm run build`, output folder `dist`). Click **Deploy**.
4. Every push to `main` redeploys the site. To use your own domain, open the project's **Settings > Domains**.

## How it works

- `src/scene.js` builds each disc (printed label, clear hub, iridescent underside) and lays them out from the scroll position.
- `src/main.js` handles scrolling between discs, the credits table, the hover ring, the detail view and `#hash` links (for example `/#projects` opens the Projects disc directly).
- Respects `prefers-reduced-motion` and `prefers-color-scheme`, and falls back to flat images if WebGL is unavailable.
