import express from "express";
import { PORT } from "#env";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ online: true });
});

app.get("/home", (req, res) => {
  res.json({ online: true });
});

app.get("/brst", (req, res) => {
  res.json({ online: true });
});

app.get("/brut", (req, res) => {
  res.json({ online: true });
});

app.get("/brlt", (req, res) => {
  res.json({ online: true });
});

app.get("/ebot", (req, res) => {
  res.json({ online: true });
});

app.get("/pro", (req, res) => {
  res.json({ online: true });
});

app.listen(PORT, () => {
  console.log(`servidor funcionando en: http://localhost:${PORT}`);
});
