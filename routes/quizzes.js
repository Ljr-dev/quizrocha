const express = require("express");

const router = express.Router();

const db = require("../database/db");

const auth = require("../middlewares/auth");



function gerarSlug(texto){

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-|-$/g,"");

}



/* =========================
   LISTAR QUIZZES
========================= */

router.get("/", auth, (req, res) => {

  db.all(
    `
    SELECT

      quizzes.*,

      (
        SELECT COUNT(*)
        FROM questions
        WHERE questions.quiz_id = quizzes.id
      ) as total_questions,

      (
        SELECT COUNT(*)
        FROM options
        INNER JOIN questions
        ON questions.id = options.question_id
        WHERE questions.quiz_id = quizzes.id
      ) as total_options

    FROM quizzes

    WHERE user_id = ?

    ORDER BY id DESC
    `,
    [req.user.id],

    (err, quizzes) => {

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json(quizzes);

    }
  );

});



/* =========================
   BUSCAR POR SLUG
========================= */

router.get("/slug/:slug", (req, res) => {

  db.get(
    `
    SELECT *
    FROM quizzes
    WHERE slug = ?
    `,
    [req.params.slug],

    (err, quiz) => {

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json(quiz);

    }
  );

});



/* =========================
   BUSCAR QUIZ
========================= */

router.get("/quiz/:id", (req, res) => {

  db.get(
    `
    SELECT *
    FROM quizzes
    WHERE id = ?
    `,
    [req.params.id],

    (err, quiz) => {

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json(quiz);

    }
  );

});



/* =========================
   CRIAR QUIZ
========================= */

router.post("/", auth, (req, res) => {

  const {
    title,
    is_public,
    password
  } = req.body;

  const slug =
    gerarSlug(title);

  db.run(
    `
    INSERT INTO quizzes
    (
      user_id,
      title,
      slug,
      is_public,
      password
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      req.user.id,
      title,
      slug,
      is_public,
      password
    ],

    function(err){

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json({
        message:"Quiz criado"
      });

    }
  );

});



/* =========================
   QUIZ COMPLETO
========================= */

router.get("/:quizId/full", (req, res) => {

  db.all(
    `
    SELECT *
    FROM questions
    WHERE quiz_id = ?
    `,
    [req.params.quizId],

    async (err, questions) => {

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      const resultado = [];



      for(const q of questions){

        const options =
          await new Promise((resolve) => {

            db.all(
              `
              SELECT id, text
              FROM options
              WHERE question_id = ?
              `,
              [q.id],

              (err, rows) => {

                resolve(rows);

              }
            );

          });



        resultado.push({
          ...q,
          options
        });

      }

      res.json(resultado);

    }
  );

});



/* =========================
   CHECK
========================= */

router.get("/check/:optionId", (req, res) => {

  db.get(
    `
    SELECT *
    FROM options
    WHERE id = ?
    `,
    [req.params.optionId],

    (err, option) => {

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json({
        correct:
          option.is_correct === 1
      });

    }
  );

});



/* =========================
   CORRETA
========================= */

router.get(
  "/questions/:questionId/correct",
  (req, res) => {

    db.get(
      `
      SELECT *
      FROM options
      WHERE question_id = ?
      AND is_correct = 1
      `,
      [req.params.questionId],

      (err, option) => {

        if(err){

          return res.status(500).json({
            error: err.message
          });

        }

        res.json(option);

      }
    );

});



/* =========================
   VALIDAR SENHA
========================= */

router.post(
  "/:quizId/validate-password",
  (req, res) => {

    const { password } = req.body;

    db.get(
      `
      SELECT *
      FROM quizzes
      WHERE id = ?
      `,
      [req.params.quizId],

      (err, quiz) => {

        if(err){

          return res.status(500).json({
            error: err.message
          });

        }

        if(quiz.is_public == 1){

          return res.json({
            success:true
          });

        }

        if(quiz.password === password){

          return res.json({
            success:true
          });

        }

        res.json({
          success:false
        });

      }
    );

});



/* =========================
   RESULTADO
========================= */

router.post("/:quizId/result", (req, res) => {

  const {
    player_name,
    score
  } = req.body;

  db.run(
    `
    INSERT INTO results
    (
      quiz_id,
      player_name,
      score
    )
    VALUES (?, ?, ?)
    `,
    [
      req.params.quizId,
      player_name,
      score
    ],

    function(err){

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json({
        message:"Resultado salvo"
      });

    }
  );

});



/* =========================
   RANKING
========================= */

router.get("/:quizId/ranking", (req, res) => {

  db.all(
    `
    SELECT *
    FROM results
    WHERE quiz_id = ?
    ORDER BY score DESC
    LIMIT 10
    `,
    [req.params.quizId],

    (err, ranking) => {

      if(err){

        return res.status(500).json({
          error: err.message
        });

      }

      res.json(ranking);

    }
  );

});



module.exports = router;