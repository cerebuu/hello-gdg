# Bisaya Crop Doctor

Bisaya Crop Doctor is a mobile-first decision aid for farmers in the Davao
Region. A farmer takes or uploads a photo of a banana or cacao leaf or fruit
and receives possible disease guidance in Bisaya or Filipino.

The app says **possible**, never **confirmed**. It is designed to help a farmer
decide what to observe next and when to ask an agriculture professional. It is
not a lab diagnosis.

## The problem

Crop problems are hard to identify from a phone photo. Advice may be difficult
to find, difficult to understand, or too confident for the evidence available.
Farmers need a quick first step that respects local language and clearly shows
its limits.

## The solution

Bisaya Crop Doctor provides:

- A simple phone-first upload and camera flow for banana and cacao.
- Possible problem guidance in Bisaya or Filipino.
- Three practical next steps and a clear “when to call an expert” message.
- An offline sample-demo mode for presentations and low-connectivity moments.
- A printable farmer card and a copy button for sharing the guidance.
- Safety wording that avoids branded chemical names and dosages.

## How it works

1. The farmer chooses Bisaya or Filipino.
2. The farmer takes a photo or selects one from the phone.
3. In live mode, the server sends the image and language choice to Google
   Gemini. The API key stays on the server.
4. The app displays a possible crop problem, uncertainty, actions, and an
   agriculture-office escalation message.
5. If live mode is unavailable, the farmer can explicitly choose a labeled
   sample result. A sample is never presented as a diagnosis of the uploaded
   photo.

## Setup

Requirements: Node.js 22.12 or newer. Node 24 LTS is recommended.

```sh
npm run install:all
cp .env.example .env
```

Open `.env` and add your own values for `GEMINI_API_KEY` and `GEMINI_MODEL`.
Never commit the file or share the key.

Start the app:

```sh
npm run dev
```

The client runs at `http://localhost:5173` and the server normally runs at
`http://localhost:3001`.

## Safety design

- Guidance is framed as possible, not confirmed.
- The interface always shows: “This is a decision aid, not a lab diagnosis.”
- Low-confidence and non-plant images are treated honestly.
- The app recommends an agriculture professional when the evidence is unclear
  or the problem is serious.
- The app does not provide branded chemical names or dosages.
- Sample mode is labeled SAMPLE and does not call the diagnosis API.
- Images are sent to the live server only when the user submits live mode.

## Current limits

Language wording, crop guidance, and representative photos still need review
by native speakers and qualified agriculture professionals. Live mode needs
internet access. The app has been tested on limited photos, not as a validated
diagnostic system.

## Credits

- Banana leaf reference: [Roboflow banana-leaf-disease dataset by LUIS
  MANUEL](https://universe.roboflow.com/luis-manuel/banana-leaf-disease-qesr2-m44),
  public domain.
- Generalist model: Kilimo Afya, CC BY 4.0.
- Cacao model reference: cacao-lsksj, CC BY 4.0.
- Cacao reference: [Br-Al/Cocoa-diseases](https://github.com/Br-Al/Cocoa-diseases).
  Its README reports that 30 to 40 percent of world cocoa production is lost
  to pests and diseases; that figure is attributed to that README and is not a
  measurement of this app.
