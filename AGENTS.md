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

| Area | Files and responsibilities | Owner |
| --- | --- | --- |
| UI | `client/src/App.jsx`, `client/src/components/PhotoUpload.jsx`, `client/src/components/LanguageToggle.jsx`, API call and loading/error state | @MarkDanielCona |
| UI | `client/src/components/ResultCard.jsx`, `client/src/components/SampleButtons.jsx`, share-with-agri-office report, styling in `client/src/index.css` | @szi-asesor |
| Backend | Server Gemini service, `POST /api/diagnose` route, JSON schema validation | @Yknowjeff |
| Backend and samples | `data/samples.json`, `public/samples/`, server fallback to sample results, `server/scripts/test-diagnose.js` | @Bruce-John-Me |

`client/` holds the React UI, `server/` the Express API, `data/` future sample
results, `public/samples/` future sample images, and `docs/` the API contract and
pitch notes. Listed future responsibilities do not imply implemented features.
Empty folders retain `.gitkeep`. The client UI renders labeled placeholders.
`client/src/mockResult.js` is an illustrative fixture for future UI development.

Nobody edits another person's files without asking in the group chat first.

## Rules

- Keep files small and single-purpose.
- Do not reformat or rewrite files you were not asked to change.
- Work on a `feature/<short-name>` branch, make small commits with clear messages,
  and never push directly to main.
- One flow only: no login, no settings, no extra pages.
- Always show the disclaimer "This is a decision aid, not a lab diagnosis."
- Never commit API keys. Never expose server secrets in client code or VITE variables.
- Follow [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for all diagnosis data.
