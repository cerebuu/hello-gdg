# Bisaya Crop Doctor live demo runbook

## Before the demo

1. On the laptop, open the app at `http://localhost:5173`. For a phone on the
   same Wi-Fi, open `http://<laptop-ip>:5173` in the phone browser. Replace
   `<laptop-ip>` with the laptop's local network address.
2. Confirm the home screen shows **Bisaya Crop Doctor** and the disclaimer:
   “This is a decision aid, not a lab diagnosis.”
3. Keep one banana leaf photo ready in the file picker. Use a clear, well-lit
   banana leaf image from the prepared demo assets. Do not use a private
   farmer photo without permission.
4. Confirm the server is running and live-mode credentials are configured
   privately. Do not display the `.env` file or any key.
5. Keep the sample-mode controls visible as the backup.

## Main path: live mode

| Step | Exact action | What to say |
| --- | --- | --- |
| 1 | Tap the **Bisaya** language option. | “I will ask for guidance in the farmer’s language.” |
| 2 | Tap the photo upload area or the camera button. | “The farmer starts with one leaf photo.” |
| 3 | In the file picker, tap the prepared banana leaf photo, then tap **Choose** or **Open**. | “This is a banana leaf image. The app does not claim the photo is enough for confirmation.” |
| 4 | Check the preview, then tap **Get possible guidance**. | “I am submitting live mode. The image goes through our server to Gemini.” |
| 5 | Wait for the result card. Point to the possible problem, confidence, and severity. | “Notice the word possible. The app gives three actions and tells us when to call an expert.” |
| 6 | Tap **Copy report**. | “The farmer can copy the guidance to share.” |
| 7 | Tap **Print farmer card** if a printer or print preview is available. | “The same information can become a simple farmer card.” |

## Backup path: sample mode

1. Tap the sample or demo control.
2. Choose the prepared **banana leaf** sample.
3. Confirm the result shows **SAMPLE** and the offline-demo label.
4. Point out that the sample illustration and result are separate from any
   uploaded photo.

Say: “I am switching to sample mode. This is a saved example, not a diagnosis
of the uploaded photo.”

## Failure fallbacks

### Live mode is slow or the server returns an error

If the result has not appeared after the normal wait, do not keep the audience
waiting. Tap the sample/demo control and choose the banana leaf sample.

Say exactly: **“Live mode needs internet, so I am switching to sample mode.”**

Then point out the SAMPLE label and continue with the result, copy, and print
steps.

### Wi-Fi is down

Tap the sample/demo control and choose the prepared banana leaf sample.

Say exactly: **“Live mode needs internet, so I am switching to sample mode.”**

Do not imply that the sample describes the uploaded photo.

### Camera permission is denied

Dismiss the permission message. Tap the upload area and choose the prepared
banana leaf photo from the device files instead.

If file selection is also unavailable, use sample mode.

Say exactly: **“Live mode needs internet, so I am switching to sample mode.”**

The sample fallback is acceptable even when the original failure was camera
permission, because it keeps the demo honest and moving.

## Closing the demo

End by pointing to the disclaimer and saying: “The app helps with a possible
next step. It does not replace a lab diagnosis or an agriculture professional.”
