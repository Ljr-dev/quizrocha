const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/lead", (req, res) => {
  console.log("Lead recebido:", req.body);
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});