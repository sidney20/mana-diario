const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// Carregar dados de ambas as versões
const nviPath = path.join(__dirname, "data", "pt_nvi.json");
const acfPath = path.join(__dirname, "acf.json");

let nviData = null;
let acfData = null;

// Carregar NVI
try {
  nviData = JSON.parse(fs.readFileSync(nviPath, "utf8"));
} catch (err) {
  console.log("Aviso: Arquivo NVI não encontrado");
}

// Carregar ACF
try {
  acfData = JSON.parse(fs.readFileSync(acfPath, "utf8"));
} catch (err) {
  console.log("Aviso: Arquivo ACF não encontrado");
}

// ✅ ROTA RAIZ - Mantida conforme requisito
app.get("/", (req, res) => {
  res.json({ 
    status: "API da Bíblia Online 🙏",
    versoes: nviData ? ["nvi"] : [] + (acfData ? ["acf"] : [])
  });
});

// 📚 Listar todos os livros da Bíblia NVI
app.get("/biblia/nvi/livros", (req, res) => {
  if (!nviData) {
    return res.status(404).json({ erro: "NVI não disponível" });
  }
  
  const livros = nviData.livros.map(livro => ({
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

// 📚 Listar todos os livros da Bíblia ACF
app.get("/biblia/acf/livros", (req, res) => {
  if (!acfData) {
    return res.status(404).json({ erro: "ACF não disponível" });
  }
  
  const livros = acfData.livros.map(livro => ({
    id: livro.id,
    nome: livro.nome,
    abreviatura: livro.abreviatura,
    totalCapitulos: livro.capitulos.length
  }));
  res.json({
    versao: "ACF",
    totalLivros: livros.length,
    livros
  });
});

// 📖 Retornar capítulo completo NVI
app.get("/biblia/nvi/:livro/:capitulo", (req, res) => {
  if (!nviData) {
    return res.status(404).json({ erro: "NVI não disponível" });
  }
  
  const { livro, capitulo } = req.params;

  const livroEncontrado = nviData.livros.find(
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

// 📖 Retornar capítulo completo ACF
app.get("/biblia/acf/:livro/:capitulo", (req, res) => {
  if (!acfData) {
    return res.status(404).json({ erro: "ACF não disponível" });
  }
  
  const { livro, capitulo } = req.params;

  const livroEncontrado = acfData.livros.find(
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
    versao: "ACF",
    livro: livroEncontrado.nome,
    abreviatura: livroEncontrado.abreviatura,
    capitulo: parseInt(capitulo),
    versiculos: capituloEncontrado.versiculos
  });
});

// 📖 Retornar versículo específico NVI
app.get("/biblia/nvi/:livro/:capitulo/:versiculo", (req, res) => {
  if (!nviData) {
    return res.status(404).json({ erro: "NVI não disponível" });
  }
  
  const { livro, capitulo, versiculo } = req.params;

  const livroEncontrado = nviData.livros.find(
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

// 📖 Retornar versículo específico ACF
app.get("/biblia/acf/:livro/:capitulo/:versiculo", (req, res) => {
  if (!acfData) {
    return res.status(404).json({ erro: "ACF não disponível" });
  }
  
  const { livro, capitulo, versiculo } = req.params;

  const livroEncontrado = acfData.livros.find(
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
    versao: "ACF",
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
