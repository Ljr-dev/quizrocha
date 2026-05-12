// routes/admin.js

const express = require("express");

const router = express.Router();

const db = require("../database/db");



/* =========================================
   SENHA MASTER
========================================= */

const MASTER_PASSWORD =
  process.env.ADMIN_PASSWORD || "Cris05Le02@";



/* =========================================
   LOGIN
========================================= */

router.post("/login",(req,res)=>{

  const { password } = req.body;

  if(password !== MASTER_PASSWORD){

    return res.status(401).json({
      success:false,
      message:"Senha inválida"
    });

  }

  res.json({
    success:true
  });

});



/* =========================================
   LISTAR TABELAS
========================================= */

router.get("/tables",(req,res)=>{

  db.all(`

    SELECT name

    FROM sqlite_master

    WHERE type='table'

    AND name NOT LIKE 'sqlite_%'

    ORDER BY name ASC

  `,[],(err,tables)=>{

    if(err){

      return res.status(500).json({
        success:false,
        error:err.message
      });

    }

    res.json(
      tables.map(t=>({
        name:t.name
      }))
    );

  });

});



/* =========================================
   DADOS DAS TABELAS
========================================= */
router.get("/table/:name",(req,res)=>{

  const table = req.params.name;

  let query = "";



  /* =====================================
     USERS
  ===================================== */

  if(table === "users"){

    query = `

      SELECT

        users.id,

        users.name,

        users.email

      FROM users

      ORDER BY users.id DESC

      LIMIT 200

    `;

  }



  /* =====================================
     QUIZZES
  ===================================== */

  else if(table === "quizzes"){

    query = `

      SELECT

        quizzes.id,

        quizzes.title,

        quizzes.slug,

        quizzes.is_public,

        quizzes.password,

        users.name AS owner_name

      FROM quizzes

      LEFT JOIN users
        ON users.id = quizzes.user_id

      ORDER BY quizzes.id DESC

      LIMIT 200

    `;

  }



  /* =====================================
     QUESTIONS
  ===================================== */

  else if(table === "questions"){

    query = `

      SELECT

        questions.id,

        quizzes.title AS quiz_name,

        users.name AS owner_name,

        questions.question

      FROM questions

      LEFT JOIN quizzes
        ON quizzes.id = questions.quiz_id

      LEFT JOIN users
        ON users.id = quizzes.user_id

      ORDER BY questions.id DESC

      LIMIT 200

    `;

  }



  /* =====================================
     OPTIONS
  ===================================== */

  else if(table === "options"){

    query = `

      SELECT

        options.id,

        quizzes.title AS quiz_name,

        questions.question,

        options.text,

        options.is_correct

      FROM options

      LEFT JOIN questions
        ON questions.id = options.question_id

      LEFT JOIN quizzes
        ON quizzes.id = questions.quiz_id

      ORDER BY options.id DESC

      LIMIT 200

    `;

  }



  /* =====================================
     RESULTS
  ===================================== */

  else if(table === "results"){

    query = `

      SELECT

        results.id,

        quizzes.title AS quiz_name,

        users.name AS owner_name,

        results.player_name,

        results.score,

        results.created_at

      FROM results

      LEFT JOIN quizzes
        ON quizzes.id = results.quiz_id

      LEFT JOIN users
        ON users.id = quizzes.user_id

      ORDER BY results.id DESC

      LIMIT 200

    `;

  }



  /* =====================================
   ANSWER LOGS
===================================== */

else if(table === "answer_logs"){

  query = `

    SELECT

      answer_logs.id,

      quizzes.title AS quiz_name,

      users.name AS owner_name,

      questions.question

    FROM answer_logs

    LEFT JOIN quizzes
      ON quizzes.id = answer_logs.quiz_id

    LEFT JOIN users
      ON users.id = quizzes.user_id

    LEFT JOIN questions
      ON questions.id = answer_logs.question_id

    ORDER BY answer_logs.id DESC

    LIMIT 200

  `;

}


  /* =====================================
     FALLBACK
  ===================================== */

  else{

    query = `
      SELECT *
      FROM ${table}
      LIMIT 200
    `;

  }



  db.all(query,[],(err,rows)=>{

    if(err){

      console.error(err);

      return res.status(500).json({
        success:false,
        error:err.message
      });

    }



    const formattedRows =
      rows.map(row=>{

        const newRow = {...row};



        if(newRow.created_at){

          try{

            newRow.created_at =
              new Date(newRow.created_at)
              .toLocaleString("pt-BR");

          }catch(e){}

        }



        return newRow;

      });



    res.json({

      success:true,

      total:formattedRows.length,

      data:formattedRows

    });

  });

});


/* =========================================
   ESTATÍSTICAS
========================================= */

router.get("/stats",(req,res)=>{

  const stats = {};



  db.get(
    `SELECT COUNT(*) AS total FROM users`,
    [],
    (err,row)=>{

      stats.users = row?.total || 0;



      db.get(
        `SELECT COUNT(*) AS total FROM quizzes`,
        [],
        (err2,row2)=>{

          stats.quizzes = row2?.total || 0;



          db.get(
            `SELECT COUNT(*) AS total FROM questions`,
            [],
            (err3,row3)=>{

              stats.questions = row3?.total || 0;



              db.get(
                `SELECT COUNT(*) AS total FROM results`,
                [],
                (err4,row4)=>{

                  stats.results = row4?.total || 0;



                  db.get(
                    `SELECT COUNT(*) AS total FROM answer_logs`,
                    [],
                    (err5,row5)=>{

                      stats.answer_logs =
                        row5?.total || 0;



                      stats.total =
                        stats.users +
                        stats.quizzes +
                        stats.questions +
                        stats.results +
                        stats.answer_logs;



                      res.json({
                        success:true,
                        stats
                      });

                    }
                  );

                }
              );

            }
          );

        }
      );

    }
  );

});



module.exports = router;