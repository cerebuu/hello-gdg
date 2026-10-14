import { createApp } from './app.js'

const port = process.env.PORT || 3001
const app = createApp()

app.listen(port, '127.0.0.1', () => {
  console.log(`Server listening on http://127.0.0.1:${port}`)
})
