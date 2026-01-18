const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// Carregar dados da Bíblia NVI
const bibliaPath = path.join(__dirname, "data", "pt_nvi.json");
const bibliaData = JSON.parse(fs.readFileSync(bibliaPath, "utf8"));

// ✅ ROTA RAIZ - Mantida conforme requisito
app.get("/", (req, res) => {
  res.json({ status: "API da Bíblia Online 🙏" });
});

// 📚 Listar todos os livros da Bíblia NVI
app.get("/biblia/nvi/livros", (req, res) => {
  const livros = bibliaData.livros.map(livro => ({
    id: livro.id,
    nome: livro.nome,
    abreviatura: livro.abreviatura,
    totalCapitulos: livro.capitulos.length
  }));
  res.json({
    versao: "NVI",
    totalLivros: livros.length,
    livros
  });
});

// 📖 Retornar capítulo completo
app.get("/biblia/nvi/:livro/:capitulo", (req, res) => {
  const { livro, capitulo } = req.params;

  const livroEncontrado = bibliaData.livros.find(
    l => l.abreviatura.toLowerCase() === livro.toLowerCase() ||
         l.nome.toLowerCase() === livro.toLowerCase()
  );

  if (!livroEncontrado) {
    return res.status(404).json({
      erro: "Livro não encontrado",
      livro: livro
    });
  }

  const capituloEncontrado = livroEncontrado.capitulos.find(
    c => c.numero === parseInt(capitulo)
  );

  if (!capituloEncontrado) {
    return res.status(404).json({
      erro: "Capítulo não encontrado",
      livro: livroEncontrado.nome,
      capitulo: capitulo
    });
  }

  res.json({
    versao: "NVI",
    livro: livroEncontrado.nome,
    abreviatura: livroEncontrado.abreviatura,
    capitulo: parseInt(capitulo),
    versiculos: capituloEncontrado.versiculos
  });
});

// 📖 Retornar versículo específico
app.get("/biblia/nvi/:livro/:capitulo/:versiculo", (req, res) => {
  const { livro, capitulo, versiculo } = req.params;

  const livroEncontrado = bibliaData.livros.find(
    l => l.abreviatura.toLowerCase() === livro.toLowerCase() ||
         l.nome.toLowerCase() === livro.toLowerCase()
  );

  if (!livroEncontrado) {
    return res.status(404).json({
      erro: "Livro não encontrado",
      livro: livro
    });
  }

  const capituloEncontrado = livroEncontrado.capitulos.find(
    c => c.numero === parseInt(capitulo)
  );

  if (!capituloEncontrado) {
    return res.status(404).json({
      erro: "Capítulo não encontrado",
      livro: livroEncontrado.nome,
      capitulo: capitulo
    });
  }

  const textoVersiculo = capituloEncontrado.versiculos[versiculo];

  if (!textoVersiculo) {
    return res.status(404).json({
      erro: "Versículo não encontrado",
      livro: livroEncontrado.nome,
      capitulo: parseInt(capitulo),
      versiculo: parseInt(versiculo)
    });
  }

  res.json({
    versao: "NVI",
    livro: livroEncontrado.nome,
    abreviatura: livroEncontrado.abreviatura,
    capitulo: parseInt(capitulo),
    versiculos: {
      [versiculo]: textoVersiculo
    }
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`📖 Bíblia API rodando em http://localhost:${PORT}`);
});
