const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

console.log("Iniciando carregamento de dados...");

// Carregar dados de ambas as versões
const nviPath = path.join(__dirname, "data", "pt_nvi.json");
const acfPath = path.join(__dirname, "acf.json");

let nviData = null;
let acfData = null;

// Carregar NVI
try {
  console.log("Tentando carregar NVI...");
  nviData = JSON.parse(fs.readFileSync(nviPath, "utf8"));
  console.log("✅ NVI carregada com sucesso!");
} catch (err) {
  console.log("❌ Erro ao carregar NVI:", err.message);
}

// Carregar ACF
try {
  console.log("Tentando carregar ACF...");
  acfData = JSON.parse(fs.readFileSync(acfPath, "utf8"));
  console.log("✅ ACF carregada com sucesso!");
} catch (err) {
  console.log("❌ Erro ao carregar ACF:", err.message);
}

// ✅ ROTA RAIZ
app.get("/", (req, res) => {
  const versoes = [];
  if (nviData) versoes.push("nvi");
  if (acfData) versoes.push("acf");
  
  res.json({ 
    status: "API da Bíblia Online 🙏",
    versoes: versoes
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
    livros: livros.slice(0, 5)  // Retorna apenas os 5 primeiros
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`📖 Bíblia API rodando em http://127.0.0.1:${PORT}`);
});
