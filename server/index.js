import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/diagnose', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`Server listening on http://localhost:${port}`)
})
