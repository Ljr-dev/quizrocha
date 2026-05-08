const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const db = require("../database/db");



/* =========================
   REGISTER
========================= */

router.post(
  "/register",
  async (req, res) => {

    const {
      name,
      email,
      password
    } = req.body;



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



        db.run(
          `
          INSERT INTO users
          (
            name,
            email,
            password
          )
          VALUES (?, ?, ?)
          `,
          [
            name,
            email,
            hash
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
                  id:this.lastID
                },
                "quizrocha"
              );



            res.json({

              token,

              user:{
                id:this.lastID,
                name,
                email
              }

            });

          }
        );

      }
    );

});



/* =========================
   LOGIN
========================= */

router.post(
  "/login",
  (req, res) => {

    const {
      email,
      password
    } = req.body;



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



        const token =
          jwt.sign(
            {
              id:user.id
            },
            "quizrocha"
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