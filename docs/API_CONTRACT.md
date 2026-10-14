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
  language: "bisaya" | "filipino"
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
