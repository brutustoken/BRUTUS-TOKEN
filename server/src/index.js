import express from "express"
import { PORT } from "#env"

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
    res.json({ online: true })
})

app.get("/brst", (req, res) => {
    res.json({ online: true })
})

app.listen(PORT, () => {
    console.log(`servidor funcionando en: http://localhost:${PORT}`)
})