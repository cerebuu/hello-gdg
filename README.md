# Bisaya Crop Doctor

Starter scaffold for the 3-hour SUBAY AI Hackathon (DEVCON Davao), judged on
problem clarity, solution quality, and a working prototype demo.

## Problem

Smallholder banana and cacao farmers in Davao struggle to identify crop diseases
early because agronomists are scarce and expensive to reach. Delayed action costs
them harvests and income.

## Solution

A farmer photographs a sick leaf or fruit and gets a likely diagnosis and clear
action steps in Bisaya or Filipino, so they can act before the disease spreads.

**This is a decision aid, not a lab diagnosis.**

This repository contains UI placeholders and one illustrative Bisaya mock response.
Photo upload, diagnosis,
language switching, Gemini calls, and sample results are not implemented.

## SDGs

- SDG 2: Zero Hunger
- SDG 1: No Poverty
- SDG 8: Decent Work and Economic Growth

## Team

- Jefferson F. Laspiñas
- Mark Daniel Cona
- Bruce John B. Arevalo
- Szianzey Asesor
- Caleb Adriel Tingson

## How to run

Use Node.js 22.12+ (Node 24 LTS recommended) and npm.

```sh
git clone https://github.com/cerebuu/hello-gdg.git
cd hello-gdg
# After the scaffold branch is pushed, check it out:
git checkout feature/scaffold
npm run install:all
cp .env.example .env
npm run dev
```

Open http://localhost:5173. The server defaults to port 3001; Vite proxies `/api`
to it. `GET http://localhost:5173/api/health` returns `{ "status": "ok" }`.
`POST /api/diagnose` returns HTTP 501 with `{ "message": "Not implemented yet" }`.

The root `.env` is ignored by Git. No key is required for this scaffold. Fill in
`GEMINI_MODEL` with the current model name from Google AI Studio when the team
adds Gemini. Never commit API keys or expose them in the client.

```sh
npm run build
```

The production client output is in `client/dist`. Deploying the API or setting up
a production proxy is outside this scaffold.

## Folder layout

```text
client/          React + Vite + Tailwind UI and placeholder components
server/          Minimal Express API; future Gemini proxy
data/            Sample result JSON (later)
public/samples/  Sample images (later); Vite's public assets
docs/            API contract and future pitch notes
```

Diagnosis data must follow [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

See [AGENTS.md](AGENTS.md) for suggested folder ownership and contribution rules.
Work on `feature/<short-name>` branches; never push directly to main.

## Screenshot

_Placeholder: add a screenshot of the working prototype here._
