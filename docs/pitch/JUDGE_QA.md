# Judge Q&A

## 1. How accurate is it?

We do not claim an accuracy percentage. This prototype gives possible
guidance, not confirmation. It needs expert-reviewed evaluation on real,
consented field photos before accuracy claims would be responsible.

## 2. Why use Gemini?

Gemini can accept an image and return structured, multilingual guidance quickly
for a prototype. We constrain the response and add safety wording. It is a
component, not proof that the output is correct.

## 3. Why not train a model now?

A trained detector needs a carefully labeled, representative dataset and
evaluation. We are not presenting a small prototype as if it had that
validation. A trained detector is a roadmap item and could become a second
opinion.

## 4. What happens to a farmer’s photo?

In live mode, the submitted image goes to our server so it can call Gemini.
The API key stays server-side. We should define and publish a retention policy
before production. Farmers should not upload private images without consent.

## 5. Is it really offline?

Sample mode works without a diagnosis API call after the app and samples are
available. Live diagnosis needs internet. Sample mode is clearly labeled and
does not pretend to analyze a new photo.

## 6. What if the model is wrong?

The app says possible, shows uncertainty, avoids confirmation, and tells the
user when to call an expert. We do not provide branded chemical names or
dosages. Expert and native-speaker review are still needed.

## 7. Why not recommend pesticides?

Product and dosage advice can be unsafe without local context, diagnosis,
label instructions, and professional guidance. The prototype focuses on
observation, low-risk next steps, and escalation.

## 8. How good is the Bisaya language?

It is usable prototype wording, not a claim of completed language
localization. Native speakers should review the wording, crop terms, and
regional expressions before wider use.

## 9. Why start with banana and cacao?

They are the prototype’s focused crops and keep the first flow understandable.
More crops need more reviewed knowledge and evaluation.

## 10. Who would use it?

The primary user is a Davao Region farmer with a phone. An agriculture or
extension officer could also use the copied or printed report as a discussion
starting point. It does not replace either user’s professional judgment.

## 11. What does it cost to run?

Live requests use a third-party model and therefore may incur API costs. We
are not claiming a cost figure yet. Sample mode does not make a model call.

## 12. Can it scale?

The web flow can be deployed behind a server and rate limits. Scaling safely
would also require privacy controls, observability, budget controls, expert
review, and evaluation. We have not demonstrated production scale.

## 13. What data trained this app?

The project credits a public-domain Roboflow banana-leaf-disease dataset by
LUIS MANUEL and the Br-Al/Cocoa-diseases repository as references. These
references do not establish the app’s accuracy. The current prototype uses
Gemini rather than claiming to have trained its own detector.

## 14. What if the photo is not a plant or is unclear?

The response can identify uncertainty and non-plant input. Low-confidence
cases should not become confident disease advice, and the user is directed to
an agriculture professional.

## 15. What is the next proof point?

We need consented field photos, native-speaker review, qualified agriculture
review, and a transparent evaluation plan. The next product step is a
source-backed knowledge base plus a trained detector as a second opinion.
