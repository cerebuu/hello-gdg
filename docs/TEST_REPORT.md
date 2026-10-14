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


## Live Gemini verification

14 October 2026, `fix/live-verify`. `.env` exists and is Git-ignored.
GEMINI_API_KEY: set. GEMINI_MODEL: set. Values were not logged; `.env` was
not changed. Only server processes were started for live calls, with a temporary
client process for the controlled timeout test. All temporary processes were
stopped afterward.

The configured legacy model returned provider NOT_FOUND (404), surfaced safely
as JSON 500 in a–d (about 0.9 s). Official documentation limits 2.5-model access
for new users. The documented `gemini-3.8-flash` also returned high-demand UNAVAILABLE
errors, surfaced as JSON 500 in 4.7–14.0 s. Successful verification used a runtime
`GEMINI_MODEL=gemini-3.5-flash-lite` override; the file remains unchanged.
**Use `GEMINI_MODEL=gemini-3.5-flash-lite` in your privately managed configuration.**

Documented image-input models confirmed in the model listing:

- [gemini-3.5-flash-lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite): tested successfully.
- [gemini-3.8-flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash): available identifier, but high-demand errors during this test.
- [gemini-3.1-pro-preview](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview): image input documented; not called in this test.

### Final cases after the timeout fix

| Case | Result | HTTP | Latency | Contract / expectation |
| --- | --- | --- | --- | --- |
| a. Banana-leaf illustration, Bisaya | PASS | 200 | 2806 ms | Diagnosis validator PASS |
| b. Same illustration, Filipino | PASS | 200 | 2663 ms | Diagnosis validator PASS |
| c. Cacao-pod illustration, Bisaya | PASS | 200 | 2665 ms | Diagnosis validator PASS |
| d. Non-plant image, Bisaya | PASS | 200 | 2808 ms | Diagnosis validator PASS; notAPlant true / Low |
| e. Image over 5 MiB | PASS | 400 | 36 ms | Clear JSON error |
| f. Malformed JSON | PASS | 400 | 2 ms | Clear JSON error |
| g. Notes only, no photo | PASS | 400 | 2 ms | Clear JSON error; notes-only is unsupported, correctly rejected |
| h. Key unset in isolated server subprocess | PASS | 500 | 6 ms | Clear JSON error; server stayed available, no crash |
| Slow Gemini + client fallback | PASS | 500 | 14042 ms | Safe timed-out JSON error; Chrome displays Offline demo mode |

Typical successful-image latency: 2736 ms.

The images were temporary generated PNG illustrations under `/private/tmp`, not
committed photos or sample SVGs. A and B returned crop unknown/Low; C treated the
cacao drawing as non-plant/Low. These are cautious contract-valid responses,
not proof of crop identification or disease accuracy. D returned non-plant/Low.
Real field-photo accuracy remains unverified. No live images are committed.

### Safety review

All successful live outputs were scanned for a finite list of chemical brands,
numeric dosage patterns, and certainty wording, then read manually. No branded
chemicals, doses, or claim of confirmed disease was observed. The final run's
single keyword hit was “sigurado” in an invitation to contact an expert for
certainty; an earlier run's “dili ka sigurado” means the user is unsure. These
are not confirmed diagnoses. No prompt change was needed. Full final language
text and sample text are in [LANGUAGE_REVIEW.md](LANGUAGE_REVIEW.md).

### Server bug fixed

The SDK timeout applies per HTTP attempt and its retry defaults can exceed the
intended overall budget. Enforced a single 14-second whole-call deadline,
abort signal, and one provider attempt. A controlled stalled SDK, routed through
Express and Vite to the real client in Chrome, returned JSON 500 at
14042 ms and triggered labeled sample fallback. This is a deterministic
fault-injection check, not an intentionally slowed production Gemini call.
The new regression test and all previous backend tests passed (11 total).
Successful live a–d and request-error e–h cases were rerun after the fix.
No client or feature changes were made.

### Remaining human checks

Change the privately managed model value as above; it was deliberately not edited.
Review Bisaya/Filipino text with native speakers and guidance with an agriculture
expert. Check real-phone camera capture, OS clipboard permissions, and physical
printing. Real crop photographs and diagnosis accuracy also need review.


## Knowledge base and second opinion

14 October 2026, feature/knowledge-detector. Server-only worktree; client untouched.
GEMINI_API_KEY: set. GEMINI_MODEL: set. ROBOFLOW_API_KEY: missing.
No credential values logged; .env was read at runtime only and not edited.

The allowed source pages list the seven requested classes but no concrete visual
symptoms. All visibleSymptoms arrays are empty; missing facts are documented in
FACTS_TO_SOURCE.md. Only names are passed as candidates, not evidence. Gemini
retains its caution, unknown/non-plant, language, no-brand and no-dosage rules.

### Live HTTP cases

Inputs were temporary synthetic PNG illustrations, not disease photographs.
These checks prove request/response handling, not disease-identification accuracy.

| Case | Result | HTTP | Latency | Contract |
| --- | --- | --- | --- | --- |
| Banana illustration, Bisaya | PASS | 200 | 2118 ms | PASS diagnosis |
| Same banana illustration, Filipino | PASS | 200 | 2083 ms | PASS diagnosis |
| Cacao illustration | PASS | 200 | 1910 ms | PASS diagnosis |
| Non-plant illustration | PASS | 200 | 1682 ms | PASS diagnosis |
| Over 5 MiB | PASS | 400 | 42 ms | PASS JSON error |
| Malformed JSON | PASS | 400 | 3 ms | PASS JSON error |
| Notes without photo (unsupported) | PASS | 400 | 2 ms | PASS JSON error |
| Missing Gemini key in isolated subprocess | PASS | 500 | 7 ms | PASS JSON error |
| Missing Roboflow key | PASS | 200 | 1996 ms typical | Live a–d return secondOpinion null; unit test confirms no network call |
| Simulated Roboflow timeout + real Gemini | PASS | 200 | 2113 ms | Valid diagnosis; optional opinion null, no main-response failure |

Typical live image latency: 1996 ms, below the approximate 4-second goal.
No prompt trimming was necessary. Synthetic banana/cacao illustrations prompted
unknown/Low or non-plant responses, so knowledgeMatch null was correct. Single-name
matching and real ready-opinion response shapes are covered by deterministic tests.

### Deterministic checks

21 tests passed. Coverage includes old response compatibility, seven empty-symptom
source entries, conservative non-negated single-name matching, malformed optional
fields, candidate prompt text, missing detector key, Authorization header transport
with no credentials in URL, junk-class exclusion, 0.5 confidence cutoff, highest
eligible prediction, provider/JSON failure, cancellation, no main-response waiting,
cacao/non-plant output suppression, and localized disagreement advice. Advice also
appears in whenToCallExpert for the unchanged client.

The default hard three-second detector timeout was tested with stalled body
parsing: null and an aborted signal at about 3003 ms. A live Gemini HTTP test used
a simulated detector stall with a shortened 200 ms test deadline; Gemini still
returned a valid 200 in 2113 ms. This is fault injection, not a claim
that a real Roboflow server was successfully called.

### Safety and human review

All a–d live responses were scanned for a finite list of brands, dosage patterns,
and certainty words and manually read. No branded chemical, dosage, or confirmed
claim was found. Null knowledge match is preferable to guessing. No model or dataset
performance figure is claimed as app accuracy.

Real hosted Roboflow inference: FAIL / unverified because ROBOFLOW_API_KEY is missing.
Its protocol and filtering are tested with injected transport; credentials, model
access, provider availability, field-photo reliability, disagreement wording, and
native Bisaya/Filipino review still require human verification. Symptom descriptions
need approved agriculture sources before adding facts. Camera, clipboard, and print
checks remain unchanged from the previous report.

### Compatibility and privacy

The request contract is unchanged, so a crop cannot be known before Gemini returns.
When enabled, Roboflow runs in parallel on the photo and only banana output is
retained. README and docs disclose this extra photo destination. A ready result
may be used; a pending result is discarded and cancelled when Gemini finishes.
There is no detector wait, URL-key fallback, or new dependency. Old responses without
the optional fields pass validation. Optional errors preserve the main guidance.

Reproduce unit tests: npm run test --prefix server. Runtime-only live fault check:
node --env-file=.env server/scripts/verify-detector-timeout.js /path/to/test.png
No images, .env, or node_modules were added to Git.

Final simulated-timeout rerun: HTTP 200, 2079 ms, contract PASS, zero safety hits.


## Expanded knowledge, confidence rubric, and hosted model comparison

14 October 2026. This section supersedes the earlier single-detector implementation
notes. Main was merged; the one conflict in server/app.js was resolved to preserve
main's English support. Main's client files were taken intact and not edited.
A later main sample-photo update was also merged intact.

Runtime configuration: GEMINI_API_KEY set; GEMINI_MODEL set; ROBOFLOW_API_KEY missing.
No key values logged, no .env edit, and no test images committed.

### Input set and important limits

The requested eight banana photos (two per sigatoka, cordana, pestalotiopsis,
healthy) and four cacao pod photos could not be obtained: Roboflow public source
page/download metadata requests failed with HTTPError, and image-listing pages
were not accessible. The permitted fallback was five existing SVG sample
illustrations, rasterized losslessly to PNG under /private/tmp. These are not
class-balanced field photos and do not establish diagnostic accuracy. The same
five inputs were used across all three Gemini models. No Cocoa-diseases code or
images were copied. Dataset Ninja was inspected as an alternative catalogue;
no dataset was downloaded or copied.

### Comparison table

Expected labels below describe sample scenarios, not verified disease ground
truth. Every detector column is unverified because its private key is missing.
Each Gemini cell contains label / confidence, HTTP status, and end-to-end latency.

| Expected/sample scenario | Banana /1 detector | Kilimo /2 classifier | Cacao Instant detector | gemini-3.5-flash-lite | gemini-2.5-flash | gemini-3.5-flash | Agreement |
| --- | --- | --- | --- | --- | --- | --- | --- |
| banana sample, not verified Sigatoka | Not called: key missing | Not called: key missing | Not called: key missing | unknown / Low; HTTP 200; 2156 ms | No diagnosis result; HTTP 500; 250 ms | No diagnosis result; HTTP 500; 4512 ms | null |
| wilting banana sample, not a supported-class truth label | Not called: key missing | Not called: key missing | Not called: key missing | unknown / Low; HTTP 200; 1997 ms | No diagnosis result; HTTP 500; 247 ms | No diagnosis result; HTTP 500; 4513 ms | null |
| healthy-looking banana sample | Not called: key missing | Not called: key missing | Not called: key missing | unknown / Low; HTTP 200; 2027 ms | No diagnosis result; HTTP 500; 251 ms | No diagnosis result; HTTP 500; 3343 ms | null |
| cacao pod-rot sample | Not called: key missing | Not called: key missing | Not called: key missing | unknown / Low; HTTP 200; 1731 ms | No diagnosis result; HTTP 500; 248 ms | No diagnosis result; HTTP 500; 4511 ms | null |
| non-plant sample | Not called: key missing | Not called: key missing | Not called: key missing | unknown / Low; HTTP 200; 1824 ms | No diagnosis result; HTTP 500; 248 ms | No diagnosis result; HTTP 500; 4512 ms | null |

All successful diagnosis responses passed the contract validator. All error
responses were JSON error objects; an error-contract pass is not a successful
diagnosis. Model availability was checked separately without logging provider
messages: 2.5 Flash returned provider 404; 3.5 Flash returned provider 503 in one
check and reached the local deadline in other calls. No fallback silently changed
the configured Gemini model. The env file was not changed.

Recommended value: **GEMINI_MODEL=gemini-3.5-flash-lite**, based on usable results
and latency, not accuracy. The other two models did not produce usable results
within the requested budget on this test run.

### Timing summary

| Model | Successful image calls | Typical latency | Limit/notes |
| --- | --- | --- | --- |
| gemini-3.5-flash-lite | 5/5 | 1997 ms | Recommended for this demo |
| gemini-2.5-flash | 0/5 | 248 ms | Provider error or local deadline; not an accuracy comparison |
| gemini-3.5-flash | 0/5 | 4512 ms | Provider error or local deadline; not an accuracy comparison |

### Failure checks

| Case | Result | HTTP | Latency | Evidence |
| --- | --- | --- | --- | --- |
| missingRoboflow | PASS | 200 | 1975 ms | Valid diagnosis or localized JSON error; optional opinion null |
| oversized | PASS | 400 | 47 ms | Valid diagnosis or localized JSON error; optional opinion null |
| malformed | PASS | 400 | 3 ms | Valid diagnosis or localized JSON error; optional opinion null |
| Simulated detector timeout with real Gemini | PASS | 200 | 2270 ms | Opinion null; zero safety hits |
| Non-plant sample | PASS | 200 | 1824 ms | Low confidence / non-plant handling; no detector traffic |

29 regression tests pass, including old-response acceptance, label mapping,
classification-array/dictionary decoding, crop-only calls, junk and other-crop
filtering, 0.5 cutoff, peer cancellation, default three-second cap, shared budget,
optional crop-gate failure, confidence downrating without inflation, honest
independent-source agreement, localized disagreement, and legacy English support.

Successful response text was scanned for a finite list of brands, dosages, and
confirmed-diagnosis claims; no hits were observed. Model-generated language still
needs native-speaker review. Server-generated Bisaya/Filipino messages were
localized; English field identifiers, enum values, canonical condition names,
and main's English option remain for contract compatibility.

### Image-handling audit

Server accepts JPEG/PNG/WebP and rejects decoded bytes over 5 MiB. It forwards
the decoded bytes and declared MIME type unchanged; it performs no resizing or
additional JPEG encoding. The SDK inline image field is covered by a byte-for-byte
unit assertion. Gemini 3 requests explicitly use high per-image media resolution;
2.5 retains its default for compatibility. Live 3.5 Flash-Lite requests accepted
this configuration. The provider rejects transport deadlines below ten seconds,
so transport uses at least ten seconds while the independent local timer enforces
the shorter request budget.

The client was inspected but not edited. Main's current upload path resizes the
longest edge to 1280 pixels and encodes JPEG at quality 0.85. Browser compression
can lose detail; server high resolution cannot restore it. Test real close-up
field photos and review camera focus, lighting, framing, and compression before
making accuracy claims.

### Remaining limitations

- Hosted detector callability: all three UNVERIFIED because ROBOFLOW_API_KEY is missing. No access rejection with a configured key was observed, so the cacao model was not falsely declared unavailable or removed. Recheck it with private credentials; remove/disable it if its hosted endpoint rejects the configured key/model.
- Cacao's source page lists four classes and project mAP@50 59.1%; that figure is not app accuracy or proof of Instant endpoint access.
- Kilimo's source page/CC BY attribution need manual verification after the blocked fetch. Only its requested banana classes are configured; no other-crop label is retained.
- All thirteen knowledge entries lack sourced visual symptom descriptions. They are candidate names, not a clinically validated knowledge base. No symptoms were invented.
- Clear, class-balanced disease photos were not available. Model quality, higher-confidence specificity, detector agreement in the field, and real-world accuracy remain unproven.
- Native-speaker and agriculture-officer review, real-phone camera, clipboard permissions, and physical printing remain human checks.

Reproduce: npm run test --prefix server; runtime-only model comparison:
node --env-file=.env server/scripts/compare-models.js
A single-model rerun accepts the model name as an argument. Comparison PNG inputs
must already be prepared under /private/tmp/knowledge-expanded. Raw output,
photos, and temporary browser artifacts are not committed.
