const express = require("express");
const path = require("path");

const app = express();

require("./database/db");

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quizzes");

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public/index.html")
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});