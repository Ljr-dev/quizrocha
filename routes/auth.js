const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const db = require("../database/db");

const SECRET = "quizrocha_secret";

/* =========================
   REGISTER
========================= */

router.post(
  "/register",
  async (req, res) => {

    try{

      const {
        name,
        email,
        password
      } = req.body;

      if(!name || !email || !password){

        return res.status(400).json({
          error:"Preencha todos os campos"
        });

      }

      db.get(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email],

        async (err, user) => {

          if(err){

            return res.status(500).json({
              error: err.message
            });

          }

          if(user){

            return res.status(400).json({
              error:"Email já cadastrado"
            });

          }

          const hash =
            await bcrypt.hash(
              password,
              10
            );

          /* =========================
             TESTE GRATIS 7 DIAS
          ========================= */

          const trialDate =
            new Date();

          trialDate.setDate(
            trialDate.getDate() + 7
          );

          db.run(
            `
            INSERT INTO users
            (
              name,
              email,
              password,
              plan,
              trial_ends_at
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              name,
              email,
              hash,
              "free",
              trialDate.toISOString()
            ],

            function(err){

              if(err){

                return res.status(500).json({
                  error: err.message
                });

              }

              const token =
                jwt.sign(
                  {
                    id:this.lastID,
                    email
                  },
                  SECRET,
                  {
                    expiresIn:"7d"
                  }
                );

              return res.json({

                token,

                user:{
                  id:this.lastID,
                  name,
                  email,
                  plan:"free",
                  trial_ends_at:
                    trialDate
                }

              });

            }
          );

        }
      );

    }catch(err){

      return res.status(500).json({
        error:"Erro interno"
      });

    }

});

/* =========================
   LOGIN
========================= */

router.post(
  "/login",
  (req, res) => {

    try{

      const {
        email,
        password
      } = req.body;

      if(!email || !password){

        return res.status(400).json({
          error:"Preencha email e senha"
        });

      }

      db.get(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email],

        async (err, user) => {

          if(err){

            return res.status(500).json({
              error: err.message
            });

          }

          if(!user){

            return res.status(400).json({
              error:"Usuário não encontrado"
            });

          }

          const valid =
            await bcrypt.compare(
              password,
              user.password
            );

          if(!valid){

            return res.status(400).json({
              error:"Senha inválida"
            });

          }

          /* =========================
             VALIDAR TESTE GRATIS
          ========================= */

 if(user.plan === "free"){

  /* =========================
     USUARIO ANTIGO
  ========================= */

  if(!user.trial_ends_at){

    const novaData =
      new Date();

    novaData.setDate(
      novaData.getDate() + 7
    );

    db.run(
      `
      UPDATE users
      SET trial_ends_at = ?
      WHERE id = ?
      `,
      [
        novaData.toISOString(),
        user.id
      ]
    );

    user.trial_ends_at =
      novaData.toISOString();

  }

  const agora =
    new Date();

  const fimTeste =
    new Date(
      user.trial_ends_at
    );

  if(agora > fimTeste){

    return res.status(403).json({

      error:
        "Seu período de teste expirou"

    });

  }

}

          const token =
            jwt.sign(
              {
                id:user.id,
                email:user.email
              },
              SECRET,
              {
                expiresIn:"7d"
              }
            );

          return res.json({

            token,

            user:{
              id:user.id,
              name:user.name,
              email:user.email,
              plan:user.plan,
              trial_ends_at:
                user.trial_ends_at
            }

          });

        }
      );

    }catch(err){

      return res.status(500).json({
        error:"Erro interno"
      });

    }

});

/* =========================
   USER INFO
========================= */

router.get(
  "/me",
  (req,res)=>{

    const authHeader =
      req.headers.authorization;

    if(!authHeader){

      return res.status(401).json({
        error:"Token não enviado"
      });

    }

    const token =
      authHeader.split(" ")[1];

    try{

      const decoded =
        jwt.verify(
          token,
          SECRET
        );

      db.get(
        `
        SELECT
          id,
          name,
          email,
          plan,
          trial_ends_at
        FROM users
        WHERE id = ?
        `,
        [decoded.id],

        (err,user)=>{

          if(err){

            return res.status(500).json({
              error:err.message
            });

          }

          if(!user){

            return res.status(404).json({
              error:"Usuário não encontrado"
            });

          }

          return res.json(user);

        }
      );

    }catch(err){

      return res.status(401).json({
        error:"Token inválido"
      });

    }

});

module.exports = router;