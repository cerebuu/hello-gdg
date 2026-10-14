# Bisaya Crop Doctor

Single-page prototype for the 3-hour SUBAY AI Hackathon (DEVCON Davao), judged on
problem clarity, solution quality, and a working prototype demo.

## Problem

Smallholder banana and cacao farmers in Davao struggle to identify crop diseases
early because agronomists are scarce and expensive to reach. Delayed action costs
them harvests and income.

## Solution

A farmer photographs a sick leaf or fruit and gets a likely diagnosis and clear
action steps in Bisaya or Filipino, so they can act before the disease spreads.

**This is a decision aid, not a lab diagnosis.**

The prototype supports compressed photo uploads, Gemini guidance, Bisaya/Filipino
results, five labeled sample cases, timeout fallback, and printable reports and
farmer cards. The sample images are original placeholder illustrations, not field
photos. Sample text is illustrative and needs native-speaker and agricultural
expert review.

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
# Until the core PR is merged:
git checkout feature/core
npm run install:all
npm run dev
```

Open http://localhost:5173. The server defaults to port 3001; Vite proxies `/api`
to it. `GET http://localhost:5173/api/health` returns `{ "status": "ok" }`.
`POST /api/diagnose` accepts image bytes, MIME type, and language as specified in the API contract.

No key is needed to demonstrate samples: click **Try a sample**, choose a language,
then **Share with agri office**, enter a location, and create a report. Copy its text
or print the report or large-text farmer card. The API is not called for samples.

For live diagnosis, configure `GEMINI_API_KEY` and `GEMINI_MODEL` privately in your
server environment; choose a current vision model with structured-output support
from Google AI Studio. Never commit keys or expose them in client variables. This
implementation work does not create or modify a real `.env` file. The example
file documents the names, and Node supports loading a separately managed root
environment file. Missing configuration returns a clear JSON 500 error.

Choose the **Demo backup case** before checking an uploaded photo. On failure or
after 15 seconds, the UI displays that selected sample with **Offline demo mode**
and **SAMPLE** labels. This fallback is not a diagnosis of the uploaded photo; its
report uses the sample illustration, not the user's photo. Saved samples also
work while the server is stopped, provided the client dev server remains running.
Full offline installation and caching are future work.

```sh
npm run build
```

The production client output is in `client/dist`. Deploying the API or setting up
a production proxy is outside this scaffold.

## Folder layout

```text
client/          React + Vite + Tailwind single-page UI
server/          Express API, Gemini service, validation and tests
data/            Five bilingual sample cases
public/samples/  Placeholder illustrations and source notes
docs/            API contract and future pitch notes
```

Diagnosis data must follow [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

See [AGENTS.md](AGENTS.md) for sole-coder ownership and contribution rules.
Work on `feature/<short-name>` branches; never push directly to main.

## Screenshot

_Add an approved field-photo demo screenshot here after review._

## Verification

```sh
npm run test --prefix server
node server/scripts/test-diagnose.js
```

See [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for phone-width flow checks and
remaining limitations. Browser checks use headless Chrome via its built-in
DevTools protocol and add no test library.
