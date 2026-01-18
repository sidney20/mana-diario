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
  const nviRaw = JSON.parse(fs.readFileSync(nviPath, "utf8"));
  // Transformar estrutura para formato consistente
  nviData = Array.isArray(nviRaw) ? nviRaw : nviRaw.livros || nviRaw;
  console.log("✅ NVI carregada com sucesso!");
} catch (err) {
  console.log("❌ Erro ao carregar NVI:", err.message);
}

// Carregar ACF
try {
  const acfRaw = JSON.parse(fs.readFileSync(acfPath, "utf8"));
  acfData = Array.isArray(acfRaw) ? acfRaw : acfRaw.livros || acfRaw;
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
    versoes: versoes,
    endpoints: {
      livros: "/biblia/:versao/livros",
      capitulo: "/biblia/:versao/:livro/:capitulo",
      versiculo: "/biblia/:versao/:livro/:capitulo/:versiculo"
    }
  });
});

// 📚 Listar livros - NVI
app.get("/biblia/nvi/livros", (req, res) => {
  if (!nviData) {
    return res.status(404).json({ erro: "NVI não disponível" });
  }
  
  try {
    const livros = nviData.map((livro, idx) => ({
      id: idx + 1,
      nome: livro.name || livro.nome || "",
      abreviatura: livro.abbrev || livro.abreviatura || "",
      totalCapitulos: (livro.chapters || livro.capitulos || []).length
    }));
    
    res.json({
      versao: "NVI",
      totalLivros: livros.length,
      livros: livros
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar livros", detalhes: err.message });
  }
});

// 📚 Listar livros - ACF
app.get("/biblia/acf/livros", (req, res) => {
  if (!acfData) {
    return res.status(404).json({ erro: "ACF não disponível" });
  }
  
  try {
    const livros = acfData.map((livro, idx) => ({
      id: idx + 1,
      nome: livro.name || livro.nome || "",
      abreviatura: livro.abbrev || livro.abreviatura || "",
      totalCapitulos: (livro.chapters || livro.capitulos || []).length
    }));
    
    res.json({
      versao: "ACF",
      totalLivros: livros.length,
      livros: livros
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar livros", detalhes: err.message });
  }
});

// Função auxiliar para encontrar livro
function encontrarLivro(dados, nomeLivro) {
  if (!dados) return null;
  
  const livroLower = nomeLivro.toLowerCase();
  
  return dados.find(livro => {
    const abbrev = (livro.abbrev || livro.abreviatura || "").toLowerCase();
    const nome = (livro.name || livro.nome || "").toLowerCase();
    
    return abbrev === livroLower || 
           nome === livroLower ||
           nome.includes(livroLower) ||
           abbrev.includes(livroLower);
  });
}

// 📖 Capítulo completo - NVI
app.get("/biblia/nvi/:livro/:capitulo", (req, res) => {
  if (!nviData) {
    return res.status(404).json({ erro: "NVI não disponível" });
  }
  
  try {
    const { livro, capitulo } = req.params;
    const livroNum = parseInt(capitulo);
    
    const livroEncontrado = encontrarLivro(nviData, livro);
    
    if (!livroEncontrado) {
      return res.status(404).json({ 
        erro: "Livro não encontrado",
        livro: livro
      });
    }
    
    const chapters = livroEncontrado.chapters || livroEncontrado.capitulos || [];
    const capituloIdx = livroNum - 1;
    
    if (capituloIdx < 0 || capituloIdx >= chapters.length) {
      return res.status(404).json({
        erro: "Capítulo não encontrado",
        livro: livroEncontrado.name || livroEncontrado.nome,
        capitulo: livroNum
      });
    }
    
    const versiculos = chapters[capituloIdx];
    const versiculosObj = {};
    
    if (Array.isArray(versiculos)) {
      versiculos.forEach((verso, idx) => {
        versiculosObj[idx + 1] = verso;
      });
    }
    
    res.json({
      versao: "NVI",
      livro: livroEncontrado.name || livroEncontrado.nome,
      abreviatura: livroEncontrado.abbrev || livroEncontrado.abreviatura,
      capitulo: livroNum,
      versiculos: versiculosObj
    });
  } catch (err) {
    console.error("Erro ao buscar capítulo NVI:", err);
    res.status(500).json({ 
      erro: "Erro ao buscar capítulo",
      detalhes: err.message 
    });
  }
});

// 📖 Capítulo completo - ACF
app.get("/biblia/acf/:livro/:capitulo", (req, res) => {
  if (!acfData) {
    return res.status(404).json({ erro: "ACF não disponível" });
  }
  
  try {
    const { livro, capitulo } = req.params;
    const livroNum = parseInt(capitulo);
    
    const livroEncontrado = encontrarLivro(acfData, livro);
    
    if (!livroEncontrado) {
      return res.status(404).json({ 
        erro: "Livro não encontrado",
        livro: livro
      });
    }
    
    const chapters = livroEncontrado.chapters || livroEncontrado.capitulos || [];
    const capituloIdx = livroNum - 1;
    
    if (capituloIdx < 0 || capituloIdx >= chapters.length) {
      return res.status(404).json({
        erro: "Capítulo não encontrado",
        livro: livroEncontrado.name || livroEncontrado.nome,
        capitulo: livroNum
      });
    }
    
    const versiculos = chapters[capituloIdx];
    const versiculosObj = {};
    
    if (Array.isArray(versiculos)) {
      versiculos.forEach((verso, idx) => {
        versiculosObj[idx + 1] = verso;
      });
    }
    
    res.json({
      versao: "ACF",
      livro: livroEncontrado.name || livroEncontrado.nome,
      abreviatura: livroEncontrado.abbrev || livroEncontrado.abreviatura,
      capitulo: livroNum,
      versiculos: versiculosObj
    });
  } catch (err) {
    console.error("Erro ao buscar capítulo ACF:", err);
    res.status(500).json({ 
      erro: "Erro ao buscar capítulo",
      detalhes: err.message 
    });
  }
});

// 📖 Versículo específico - NVI
app.get("/biblia/nvi/:livro/:capitulo/:versiculo", (req, res) => {
  if (!nviData) {
    return res.status(404).json({ erro: "NVI não disponível" });
  }
  
  try {
    const { livro, capitulo, versiculo } = req.params;
    const capNum = parseInt(capitulo);
    const versNum = parseInt(versiculo);
    
    const livroEncontrado = encontrarLivro(nviData, livro);
    
    if (!livroEncontrado) {
      return res.status(404).json({ 
        erro: "Livro não encontrado",
        livro: livro
      });
    }
    
    const chapters = livroEncontrado.chapters || livroEncontrado.capitulos || [];
    const capituloIdx = capNum - 1;
    
    if (capituloIdx < 0 || capituloIdx >= chapters.length) {
      return res.status(404).json({
        erro: "Capítulo não encontrado",
        livro: livroEncontrado.name || livroEncontrado.nome,
        capitulo: capNum
      });
    }
    
    const versiculos = chapters[capituloIdx];
    const versiculoIdx = versNum - 1;
    
    if (!Array.isArray(versiculos) || versiculoIdx < 0 || versiculoIdx >= versiculos.length) {
      return res.status(404).json({
        erro: "Versículo não encontrado",
        livro: livroEncontrado.name || livroEncontrado.nome,
        capitulo: capNum,
        versiculo: versNum
      });
    }
    
    res.json({
      versao: "NVI",
      livro: livroEncontrado.name || livroEncontrado.nome,
      abreviatura: livroEncontrado.abbrev || livroEncontrado.abreviatura,
      capitulo: capNum,
      versiculos: {
        [versNum]: versiculos[versiculoIdx]
      }
    });
  } catch (err) {
    console.error("Erro ao buscar versículo NVI:", err);
    res.status(500).json({ 
      erro: "Erro ao buscar versículo",
      detalhes: err.message 
    });
  }
});

// 📖 Versículo específico - ACF
app.get("/biblia/acf/:livro/:capitulo/:versiculo", (req, res) => {
  if (!acfData) {
    return res.status(404).json({ erro: "ACF não disponível" });
  }
  
  try {
    const { livro, capitulo, versiculo } = req.params;
    const capNum = parseInt(capitulo);
    const versNum = parseInt(versiculo);
    
    const livroEncontrado = encontrarLivro(acfData, livro);
    
    if (!livroEncontrado) {
      return res.status(404).json({ 
        erro: "Livro não encontrado",
        livro: livro
      });
    }
    
    const chapters = livroEncontrado.chapters || livroEncontrado.capitulos || [];
    const capituloIdx = capNum - 1;
    
    if (capituloIdx < 0 || capituloIdx >= chapters.length) {
      return res.status(404).json({
        erro: "Capítulo não encontrado",
        livro: livroEncontrado.name || livroEncontrado.nome,
        capitulo: capNum
      });
    }
    
    const versiculos = chapters[capituloIdx];
    const versiculoIdx = versNum - 1;
    
    if (!Array.isArray(versiculos) || versiculoIdx < 0 || versiculoIdx >= versiculos.length) {
      return res.status(404).json({
        erro: "Versículo não encontrado",
        livro: livroEncontrado.name || livroEncontrado.nome,
        capitulo: capNum,
        versiculo: versNum
      });
    }
    
    res.json({
      versao: "ACF",
      livro: livroEncontrado.name || livroEncontrado.nome,
      abreviatura: livroEncontrado.abbrev || livroEncontrado.abreviatura,
      capitulo: capNum,
      versiculos: {
        [versNum]: versiculos[versiculoIdx]
      }
    });
  } catch (err) {
    console.error("Erro ao buscar versículo ACF:", err);
    res.status(500).json({ 
      erro: "Erro ao buscar versículo",
      detalhes: err.message 
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📖 Bíblia API rodando em http://localhost:${PORT}`);
});
