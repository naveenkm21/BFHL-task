# SRM Full Stack Round 1

- `api/` — Cloudflare Worker, POST `/bfhl`. Deploy with `npx wrangler deploy`.
- `web-plain/` — single-file `index.html` (vanilla HTML/CSS/JS, cytoscape via CDN). No build step.

## Frontend
<img width="1912" height="914" alt="583418814-55311b2b-5c5b-415e-8a94-c2edc96bf322" src="https://github.com/user-attachments/assets/90ca5646-8d8a-4e28-9023-32c1f477b422" />

<img width="1296" height="897" alt="image" src="https://github.com/user-attachments/assets/31cb425e-ce7a-40c0-bb19-29841e2deed7" />


## Backend
<img width="666" height="702" alt="image" src="https://github.com/user-attachments/assets/5c969965-303c-4fcf-af55-a6e14a19a5ce" />




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
