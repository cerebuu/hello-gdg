# Bisaya Crop Doctor contributor guide

## Stack

JavaScript, React, Vite, Tailwind CSS via the official Vite plugin,
Node.js, Express, CORS, and concurrently. Node.js 22.12+ is required;
Node 24 LTS is recommended. Gemini integration uses the official @google/genai SDK.

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
| All implementation | Client, server, samples, integration, documentation, and tests | Caleb Adriel Tingson (sole coder) |

`client/` holds the React UI, `server/` the Express API, `data/` future sample
results, `public/samples/` future sample images, and `docs/` the API contract and
pitch notes. 
Empty folders retain `.gitkeep`. The client provides the diagnosis and labeled sample-demo flow.
`client/src/mockResult.js` is an illustrative fixture for future UI development.

Caleb is the sole coder for this prototype. Coordinate any future handoff before editing shared files.

## Rules

- Keep files small and single-purpose.
- Do not reformat or rewrite files you were not asked to change.
- Work on a `feature/<short-name>` branch, make small commits with clear messages,
  and never push directly to main.
- One flow only: no login, no settings, no extra pages.
- Always show the disclaimer "This is a decision aid, not a lab diagnosis."
- Never commit API keys. Never expose server secrets in client code or VITE variables.
- Follow [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for all diagnosis data.
