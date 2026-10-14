# Diagnosis API contract

Shared format for the server, client, and future sample results.
The server implements this API. Live requests require private server-side
GEMINI_API_KEY and GEMINI_MODEL configuration; missing configuration returns 500.

## Request

`POST /api/diagnose`, with `Content-Type: application/json`:

```ts
{
  imageBase64: string,
  mimeType: string,
  language: "bisaya" | "filipino" | "english"
}
```

`imageBase64` contains base64 image bytes without a data URL prefix.
`mimeType` identifies the image type. Supported types are image/jpeg, image/png, and image/webp. The decoded image
must be at most 5 MiB (5 × 1024 × 1024 bytes). Larger images and oversized JSON
bodies return 400. The browser resizes to at most 1280 pixels and compresses JPEG
before sending. Sample SVG placeholders are never submitted to the model.

## Successful response (HTTP 200)

```ts
{
  crop: "banana" | "cacao" | "unknown",
  problemNameEnglish: string,
  problemNameLocal: string,
  confidence: "High" | "Medium" | "Low",
  severity: "Mild" | "Moderate" | "Severe" | "Unknown",
  actionSteps: [string, string, string],
  whenToCallExpert: string,
  notAPlant: boolean
}
```

All fields are required. `actionSteps` contains exactly three strings.
`problemNameLocal`, `actionSteps`, and `whenToCallExpert` use the requested
language. English field names and enum values remain unchanged.
`notAPlant` indicates that the image does not depict a plant; use `unknown` for
crop and `Unknown` for severity when they cannot be assessed. Unknown crops
and non-plant images must have Low confidence.

## Errors

HTTP 400 for invalid requests or HTTP 500 for server failures:

```ts
{ error: string }
```

## UI disclaimer

Always show: "This is a decision aid, not a lab diagnosis."

## Mock

`client/src/mockResult.js` exports an illustrative Bisaya response for UI work.
It is fictional development text, not validated disease guidance, and is not
rendered by the scaffold or returned by the server.

## Demo fallback and provenance

`data/samples.json` stores five cases shaped as
`{ id, label, imagePath, results: { bisaya, filipino } }`.
Both language results follow the successful response format. Samples load locally
without an API call. They must be labeled SAMPLE in the UI and every report.

For an API error or a 15-second timeout, the client displays the user's selected
backup case as an offline demo, not as an inferred match or diagnosis of the
uploaded photo. The response contract stays unchanged; provenance is tracked
separately by the UI. A fallback report uses the sample illustration.


## Optional knowledge and detector metadata

Older responses without these fields still pass the validator:

```ts
{
  knowledgeMatch?: { id: string, name: string } | null,
  secondOpinion?: {
    source: "roboflow",
    crop: "banana",
    label: "healthy" | "sigatoka" | "cordana" | "pestalotiopsis",
    confidence: number // finite, 0.5 through 1 inclusive
  } | null,
  note?: string | null
}
```

The server returns these fields with null when no reliable mapping or optional
result is available. A knowledge match must be one single non-negated English
condition name for the same crop, with an exact stored id/name. Multiple candidate
names, unknown crop, and non-plant results have no match. This mapping is not proof
that a diagnosis is correct. No symptom facts are invented from class names.

The optional detector starts in parallel only when its runtime key is set, has a
hard three-second bound, and is cancelled when Gemini finishes. The response never
waits for it: only an already-ready prediction is used. Missing key, provider
failure, timeout, junk/unsupported class, confidence below 0.5, non-banana Gemini
result, and non-plant result produce null. The original request has no crop hint;
therefore configured requests may send a photo to Roboflow before Gemini determines
its crop. Only banana output is retained. Credentials use Authorization header
transport and are never put in the request URL or logs.

If both checks clearly identify different candidates, note asks for an agriculture
officer in the requested language. It is also appended to whenToCallExpert so the
unchanged existing client can display it. Neither source confirms a diagnosis.
The client need not render the optional metadata to keep its existing flow working.


## Current multi-model contract (supersedes the single-detector notes above)

The original request and eight required response fields are unchanged. The
validator still accepts old responses without any optional fields. Optional fields:

```ts
{
  knowledgeMatch?: { id: string, name: string } | null,
  secondOpinion?: { source: "roboflow", crop: "banana" | "cacao", label: string, confidence: number } | null,
  secondOpinions?: Array<{ source: "roboflow", model: string, crop: "banana" | "cacao", label: string, confidence: number }>,
  agreement?: "agree" | "differ" | null,
  note?: string | null,
  visibleEvidence?: string[], // up to four localized observations, not unseen facts
  primarySource?: "gemini" | "roboflow",
  lowConfidenceMessage?: string | null
}
```

Scores must be finite and 0.5–1 inclusive. Labels must map through a configured
model to a knowledge entry for the same crop. Foreign-crop and junk classes are
excluded. secondOpinion is the highest eligible score, not a calibrated disease
probability. secondOpinions retains the model identifiers. Agreement counts the
original Gemini condition and independent detector results, never a detector
label promoted into the primary field as a second Gemini vote. Different
Sigatoka family granularity alone is not called disagreement.

If Gemini is Low or generic/unmapped, an eligible detector label may become the
primary possible condition and knowledgeMatch, with Roboflow provenance in
primarySource and localized note. Confidence is never raised from a detector
score, and Gemini's general safe actions and severity are not overwritten. Advice
about disagreement and uncertainty is appended to whenToCallExpert so the existing
client can show it. These are suggestions, never confirmed disease findings.

Server-created error, uncertainty, and provenance messages are in the requested
language. English field identifiers and fixed machine enums remain unchanged for
compatibility. problemNameEnglish contains only a canonical condition name or
unknown; names are taxonomy/proper-name values. The unchanged client still has
some English labels and enums; fully localized UI rendering is outside this
server-only task. Model-generated wording needs native-speaker review.

### Timing and optional failure behavior

With no Roboflow key there is no crop-gate call and no Roboflow traffic. With a
key, an optional Gemini crop-only check (1.5-second bound) selects banana peers
(the first two models), cacao peer (third model), or none. A failed/uncertain gate
contributes nothing. Matching detector calls run concurrently with full Gemini
diagnosis, each bounded by three seconds and the remaining approximately
five-second request budget. A different final crop discards mismatched opinions.
The normal main call has a local 4.5-second deadline, reduced by gate time.
HTTP transport uses at least ten seconds because Gemini rejects shorter provider
deadlines; the local timer still enforces the shorter overall limit. No retry
extends this budget. Optional failures return the main guidance with null/empty
metadata. Main Gemini failures remain localized JSON 500 for client fallback.

The configured cacao Instant model is not proven callable without the private
key. It remains an optional, unverified configuration; no access failure was
observed with a configured key, so it was not falsely classified as unavailable.
