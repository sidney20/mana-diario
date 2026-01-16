const express = require("express");
const cors = require("cors");
const bible = require("./acf.json");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({ status: "API da Bíblia Online 🙏" });
});

// 📘 Lista de livros
app.get("/books", (req, res) => {
  const books = bible.map(b => ({
    name: b.name,
    abbrev: b.abbrev,
    chapters: b.chapters.length
  }));
  res.json(books);
});

// 📖 Capítulo completo
app.get("/books/:abbrev/:chapter", (req, res) => {
  const { abbrev, chapter } = req.params;

  const book = bible.find(b => b.abbrev === abbrev);
  if (!book) return res.status(404).json({ error: "Livro não encontrado" });

  const verses = book.chapters[chapter - 1];
  if (!verses) return res.status(404).json({ error: "Capítulo não encontrado" });

  res.json({
    book: book.name,
    chapter: Number(chapter),
    verses: verses.map((text, i) => ({
      verse: i + 1,
      text
    }))
  });
});

app.listen(3000, () => {
  console.log("📖 Bíblia API rodando na porta 3000");
});
