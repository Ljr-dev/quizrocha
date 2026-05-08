const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const db = require("../database/db");

const SECRET = "quizrocha_secret";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    function (err) {

      if (err) {
        return res.status(400).json({
          error: "Email já cadastrado"
        });
      }

      res.json({
        message: "Usuário criado"
      });

    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],

    async (err, user) => {

      if (!user) {
        return res.status(400).json({
          error: "Usuário não encontrado"
        });
      }

      const valid = await bcrypt.compare(
        password,
        user.password
      );

      if (!valid) {
        return res.status(400).json({
          error: "Senha inválida"
        });
      }

      const token = jwt.sign(
  {
    id: user.id,
    name: user.name,
    email: user.email
  },
  SECRET
);

res.json({
  token,
  user:{
    id:user.id,
    name:user.name,
    email:user.email
  }
});

    }
  );
});

module.exports = router;