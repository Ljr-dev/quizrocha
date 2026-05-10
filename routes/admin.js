// routes/admin.js

const express = require('express');
const router = express.Router();

const db = require('../database/db');

const MASTER_PASSWORD = 'Cris05Le02@';

// LOGIN MASTER
router.post('/login', (req, res) => {

  const { password } = req.body;

  if(password !== MASTER_PASSWORD){

    return res.status(401).json({
      success:false,
      message:'Senha inválida'
    });

  }

  res.json({
    success:true
  });

});

// LISTAR TABELAS
router.get('/tables', (req, res) => {

  db.all(`
    SELECT name 
    FROM sqlite_master 
    WHERE type='table'
    AND name NOT LIKE 'sqlite_%'
  `, [], (err, tables) => {

    if(err){

      return res.status(500).json({
        success:false,
        error:err.message
      });

    }

    res.json(tables);

  });

});

// DADOS DA TABELA
router.get('/table/:name', (req, res) => {

  const table = req.params.name;

  db.all(
    `SELECT * FROM ${table} ORDER BY id DESC`,
    [],
    (err, rows) => {

      if(err){

        return res.status(500).json({
          success:false,
          error:err.message
        });

      }

      res.json(rows);

    }
  );

});

module.exports = router;