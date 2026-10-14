# Bisaya Crop Doctor test report

Date: 14 October 2026 (Asia/Manila). Branch: `feature/core`.
Environment: macOS, Node 24.18.0, npm 11.16.0, headless Google Chrome.
Phone viewports: 390 × 844 and 320 × 568. No real `.env` was created or changed;
no key was read or printed. Dev servers were stopped after verification.

## Results

PASS means the described automated check succeeded. FAIL / unverified means
there is no validation evidence yet; it does not imply a demonstrated code defect.

| Item | Result | Evidence and limits |
| --- | --- | --- |
| Root install command | PASS | `npm run install:all --cache /private/tmp/hello-gdg-npm-cache` installed all packages; audits reported zero vulnerabilities. Existing temporary cache avoided the previously observed user-cache permissions issue. Transitive install-script and deprecation warnings did not block tests. |
| One-command development startup | PASS | `npm run dev` started Vite and Express together, with credentials absent. |
| Production build | PASS | `npm run build` produced `client/dist`. |
| Health through Vite proxy | PASS | `GET http://localhost:5173/api/health` returned `{"status":"ok"}`. |
| Request validation | PASS | Invalid base64, MIME type, language, malformed JSON, and oversized bodies return JSON 400. Exactly 5 MiB accepted by a stub provider; 5 MiB + 1 byte rejected. |
| Missing key and model | PASS | JSON 500 errors identify the missing server configuration without printing values. Missing-key message was visible in the real browser before fallback. |
| Gemini SDK request and result validation | PASS | Injected SDK tests verify inline image bytes, model, JSON response configuration, and localization prompt; malformed JSON, wrong action count, and overconfident unknown/non-plant results are rejected. |
| Live Gemini diagnosis | FAIL / unverified | No configured credentials were used. Successful frontend response rendering used a controlled HTTP mock; provider integration used an injected SDK. Configure credentials privately and test consented field photos before presenting live diagnosis as verified. |
| Bilingual sample data | PASS | All five cases in both languages pass the contract validator. All ten variants display the correct local problem name and three actions. |
| Sample provenance and no API call | PASS | Sample buttons made zero diagnosis API calls. SAMPLE labels appear in result and reports. Source notes identify all five SVGs as original illustrations, not field photos. |
| Upload and compression | PASS | Browser selected a generated 2400 × 1800 PNG, resized it to at most 1280 pixels, and produced a JPEG preview. Unsupported SVG and a 26 MiB source file show friendly errors and disable submission. |
| Camera on a physical phone | FAIL / unverified | Capture input uses `capture="environment"`; headless Chrome cannot exercise physical camera hardware or mobile browser permission UI. |
| Loading and success state | PASS | Loading indicator appears; a controlled successful response displays guidance and the submitted photo. Changing language clears a stale live result. |
| Honest uncertainty | PASS | Low-confidence and non-plant examples show "We're not sure" and agriculture-office advice in both languages. |
| API failure fallback | PASS | With a missing key and with Express completely stopped, the chosen cacao backup result and its illustration appear with Offline demo mode and SAMPLE labels. It is never described as a diagnosis of the uploaded photo. |
| 15-second fallback | PASS | A non-resolving controlled fetch was aborted after 15 seconds and displayed the selected sample in the selected Filipino language. |
| Report content | PASS | Location, date in Philippines time, photo, diagnosis, severity, actions, provenance, and disclaimer present. Fallback reports use the sample illustration, not the user's photo. |
| Copy report | PASS | Button sends the complete report text to an injected clipboard handler; selectable text is available as a fallback. Image is included only in print output. |
| Device clipboard permissions | FAIL / unverified | Real operating-system clipboard permissions were not exercised; browser API wiring was checked with an injected handler. |
| Report and farmer-card print layouts | PASS | Buttons select the correct print mode; generated PDFs exclude upload controls. Farmer card uses 22 pt action text in print. |
| Physical printer output | FAIL / unverified | PDFs were generated; physical printers were not tested. |
| Mobile layout and touch targets | PASS | Controls are at least 44 px high at 390 px width; no horizontal overflow at 390 px or 320 px with results. Screenshot inspected for readable green design and visible disclaimer. |
| Native-language and agricultural review | FAIL / unverified | Bisaya and Filipino text requires native-speaker review; crop advice and sample cases require a qualified local agriculture expert. No accuracy or efficacy claim is made. |
| Secret and dependency tracking | PASS | No real `.env` exists; `git ls-files` contains no `.env`, `.env.local`, or `node_modules` files. |

Totals: 10 backend tests, 39 online browser checks, and 34 server-offline browser
checks passed. Build and self-contained smoke script passed.

## Reproduce

```sh
npm run install:all
npm run test --prefix server
node server/scripts/test-diagnose.js
npm run build
```

Start `npm run dev` with Gemini credentials absent for the missing-key case. In a
second terminal from the repository root, run:

```sh
node server/scripts/test-browser.js online
```

Stop the combined dev process, then run only the client:

```sh
npm run dev --prefix client
# In a second terminal:
node server/scripts/test-browser.js offline
```

Browser tests use Chrome DevTools and Node's native WebSocket, adding no library.
Set `CHROME_PATH` if Chrome is installed elsewhere. Browser profiles, logs,
screenshots, and PDFs are generated under ignored `node_modules/`.

## Issues found and fixed

- Node test auto-discovery ran the smoke script before any server was listening.
  The smoke script now starts its own temporary server, and the backend test
  command explicitly targets `test/*.test.js`.
- A browser assertion expected mixed-case text while CSS rendered uppercase.
  The assertion now ignores case.
- Print styles were changed to remove surrounding UI from layout rather than
  hide it while retaining blank space.
- Base64 validation avoids a repeated grouped regex on large images.
- A terminal approval was initially rejected; work resumed after explicit user
  authorization. No denied action was bypassed.

## Implementation sources

The official Google JavaScript SDK reference documents `GoogleGenAI`,
`models.generateContent`, server-only credentials, and response configuration:
https://googleapis.github.io/js-genai/release_docs/index.html
https://googleapis.github.io/js-genai/release_docs/interfaces/types.GenerateContentConfig.html
Image input and structured-output guidance:
https://ai.google.dev/gemini-api/docs/image-understanding
https://ai.google.dev/gemini-api/docs/structured-output

## Demo limits

Offline demo mode means saved samples while the client is loaded; this is not a
PWA or a fully offline installation. For arbitrary uploads, choosing a backup
case is explicit; the app never pretends to infer a matching disease without the
model. Placeholder illustrations must be replaced with licensed, consented crop
photos before a realistic field-photo demonstration.
