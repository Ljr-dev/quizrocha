const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const db = require("../database/db");



/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {

  try{

    const {
      name,
      email,
      password
    } = req.body;



    const existe =
      db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
      `).get(email);



    if(existe){

      return res.status(400).json({
        error:"Email já cadastrado"
      });

    }



    const hash =
      await bcrypt.hash(password,10);



    db.prepare(`
      INSERT INTO users
      (
        name,
        email,
        password
      )
      VALUES (?, ?, ?)
    `).run(
      name,
      email,
      hash
    );



    res.json({
      message:"Conta criada"
    });

  }catch(err){

    res.status(500).json({
      error: err.message
    });

  }

});



/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {

  try{

    const {
      email,
      password
    } = req.body;



    const user =
      db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
      `).get(email);



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

  }catch(err){

    res.status(500).json({
      error: err.message
    });

  }

});



module.exports = router;