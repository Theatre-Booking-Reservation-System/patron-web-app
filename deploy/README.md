# Deploying the Patron Web App (working, no backend access needed)

The app talks to an **HTTP** backend. If you serve the app over HTTPS and call
the HTTP backend directly from the browser, every API call is blocked
(mixed content). GitHub Pages only serves HTTPS and cannot proxy, so it would be
a dead UI demo.

**Solution:** deploy to a host that proxies the API calls server-side —
**Netlify** or **Vercel**. Both deploy straight from the GitHub repo, give you a
free HTTPS URL, and need **no access to the backend server**.

## How it works
- The app is served at `https://<your-site>` and calls **relative** paths like
  `/identity-service/...` (see `src/environments/environment.ts`).
- The host rewrites those paths to the HTTP backend **on its own servers**:
  `/identity-service/*  ->  http://ec2-3-237-240-69.compute-1.amazonaws.com/identity-service/*`
- The browser only ever makes HTTPS calls to your site, so there is no
  mixed-content block and no CORS. The HTTP hop happens off the browser.
- Config: `netlify.toml` (Netlify) or `vercel.json` (Vercel).

---

## Option A — Netlify (recommended)

1. Push this repo to GitHub (it already is).
2. Go to https://app.netlify.com → **Add new site → Import an existing project**.
3. Pick the `patron-web-app` repo. Netlify reads `netlify.toml`, so build command
   (`npm run build`) and publish dir (`dist/patron-web-app/browser`) are already set.
4. Click **Deploy**. You get `https://<name>.netlify.app`.

CLI alternative:

    npm i -g netlify-cli
    netlify deploy --build --prod

## Option B — Vercel

1. Go to https://vercel.com → **Add New → Project** → import the repo.
2. Framework preset: **Other** (settings come from `vercel.json`).
3. Deploy. You get `https://<name>.vercel.app`.

CLI alternative:

    npm i -g vercel
    vercel --prod

---

## Verify after deploy
- Open the site; the UI loads over HTTPS.
- Open DevTools → Network. Log in or load Productions. Calls to
  `/identity-service/...`, `/catalogue-service/...` should return **200** (proxied),
  not blocked/mixed-content errors.

## Caveats
- The backend must be reachable from the host's servers (it's a public EC2
  URL, so it should be). If the backend is down, calls will error — but that's
  the backend, not the hosting.
- If the backend ever enforces a strict `Origin`/`Host` check, you may need it
  adjusted — but no backend changes are required for a standard setup.
