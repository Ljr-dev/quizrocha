const express = require("express");
const path = require("path");
const cors = require("cors");

require("./database/db");

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quizzes");

const app = express();

app.use(cors());
app.use(express.json());



// arquivos estáticos
app.use(
  express.static(
    path.join(__dirname, "public")
  )
);



// rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);



// rota play
app.get("/play/:slug", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "play.html"
    )
  );

});



// dashboard
app.get("/dashboard", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "dashboard.html"
    )
  );

});



// index
app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});



// tratamento 404 API
app.use("/api/*", (req, res) => {

  res.status(404).json({
    error: "Rota da API não encontrada"
  });

});



// tratamento geral de erro
app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    error: "Erro interno do servidor"
  });

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `🚀 Servidor rodando em http://localhost:${PORT}`
  );

});