# SRM Full Stack Round 1

- `api/` — Cloudflare Worker, POST `/bfhl`. Deploy with `npx wrangler deploy`.
- `web-plain/` — single-file `index.html` (vanilla HTML/CSS/JS, cytoscape via CDN). No build step.

## Fill in your identity

Edit `api/src/identity.ts`.

## Run / deploy

```bash
# API
cd api && npm i && npx wrangler deploy

# Frontend (no build)
cd web-plain && npx wrangler pages deploy . --project-name=bfhl-web
```

Open `web-plain/index.html` directly in a browser to test locally — no dev server needed. Edit the API URL field at the top to point at your deployed Worker.
