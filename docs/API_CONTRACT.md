# Diagnosis API contract

Shared format for the server, client, and future sample results.
This describes the planned API. The scaffold currently returns HTTP 501 with
`{ "message": "Not implemented yet" }` for every diagnosis request.

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
`mimeType` identifies the image type. Supported types and size limits will be
specified when image handling is implemented.

## Successful response (HTTP 200, planned)

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
crop and `Unknown` for severity when they cannot be assessed.

## Errors (planned)

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
