# Bisaya Crop Doctor contributor guide

## Stack

JavaScript, React, Vite, Tailwind CSS via the official Vite plugin,
Node.js, Express, CORS, and concurrently. Node.js 22.12+ is required;
Node 24 LTS is recommended. Gemini integration is not implemented.

## Run

From the repository root:

```sh
npm run install:all
cp .env.example .env
npm run dev
```

Client: http://localhost:5173. Server: http://localhost:3001 by default.
The server reads the root `.env` with Node's built-in environment-file support.
Vite proxies `/api` to the server using PORT from the environment or root `.env`.
`npm run build` builds the client into `client/dist`.
No real API key is needed for the scaffold.

## Layout and ownership

| Folder | Purpose | Owner |
| --- | --- | --- |
| `server/` | Express API; future Gemini proxy | Caleb Adriel Tingson |
| Root configuration | Integration and development scripts | Caleb Adriel Tingson |
| `client/` | Mobile-first React UI | Mark Daniel Cona |
| `data/` | Sample results (later) | Jefferson F. Laspiñas (Jeff) |
| `public/samples/` | Sample images (later); served by Vite | Jefferson F. Laspiñas (Jeff) |
| `docs/` | API contract, pitch notes, and deck | Bruce John B. Arevalo |

Szianzey Asesor is a team member; folder ownership has not been specified.
Empty folders retain `.gitkeep`. The client UI renders labeled placeholders.
`client/src/mockResult.js` is an illustrative fixture for future UI development.

## Rules

- Keep files small and single-purpose.
- Do not reformat or rewrite files you were not asked to change.
- Work on a `feature/<short-name>` branch, make small commits with clear messages,
  and never push directly to main.
- One flow only: no login, no settings, no extra pages.
- Always show the disclaimer "This is a decision aid, not a lab diagnosis."
- Never commit API keys. Never expose server secrets in client code or VITE variables.
- Follow [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for all diagnosis data.
