const express = require("express");

const router = express.Router();

const db = require("../database/db");

const auth = require("../middlewares/auth");



// ==========================
// HELPERS
// ==========================

function verificarDonoQuiz(
  quizId,
  userId
){

  return new Promise((resolve) => {

    db.get(
      `
      SELECT *
      FROM quizzes
      WHERE id = ?
      AND user_id = ?
      `,
      [quizId, userId],

      (err, quiz) => {
        resolve(!!quiz);
      }
    );

  });

}



// ==========================
// LISTAR QUIZZES
// ==========================

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



// ==========================
// BUSCAR QUIZ
// ==========================

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



// ==========================
// CRIAR QUIZ
// ==========================

router.post("/", auth, (req, res) => {

  const user_id = req.user.id;

  const {
    title,
    is_public,
    password
  } = req.body;

  db.run(
    `
    INSERT INTO quizzes
    (
      user_id,
      title,
      is_public,
      password
    )
    VALUES (?, ?, ?, ?)
    `,
    [
      user_id,
      title,
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
        message:"Quiz criado",
        quizId:this.lastID
      });

    }
  );

});



// ==========================
// EDITAR QUIZ
// ==========================

router.put(
  "/:quizId",
  auth,

  async (req, res) => {

    const permitido =
      await verificarDonoQuiz(
        req.params.quizId,
        req.user.id
      );

    if(!permitido){

      return res.status(403).json({
        error:"Sem permissão"
      });

    }

    const { title } = req.body;

    db.run(
      `
      UPDATE quizzes
      SET title = ?
      WHERE id = ?
      `,
      [
        title,
        req.params.quizId
      ],

      function(err){

        if(err){
          return res.status(500).json({
            error: err.message
          });
        }

        res.json({
          message:"Quiz atualizado"
        });

      }
    );

});



// ==========================
// EXCLUIR QUIZ
// ==========================

router.delete(
  "/:quizId",
  auth,

  async (req, res) => {

    const permitido =
      await verificarDonoQuiz(
        req.params.quizId,
        req.user.id
      );

    if(!permitido){

      return res.status(403).json({
        error:"Sem permissão"
      });

    }

    db.run(
      `
      DELETE FROM quizzes
      WHERE id = ?
      `,
      [req.params.quizId],

      function(err){

        if(err){
          return res.status(500).json({
            error: err.message
          });
        }

        res.json({
          message:"Quiz removido"
        });

      }
    );

});



// ==========================
// CHECK OWNER
// ==========================

router.get(
  "/:quizId/check-owner",
  auth,

  async (req, res) => {

    const permitido =
      await verificarDonoQuiz(
        req.params.quizId,
        req.user.id
      );

    res.json({
      owner: permitido
    });

});



// ==========================
// PERGUNTAS
// ==========================

router.post(
  "/:quizId/questions",
  auth,

  async (req, res) => {

    const permitido =
      await verificarDonoQuiz(
        req.params.quizId,
        req.user.id
      );

    if(!permitido){

      return res.status(403).json({
        error:"Sem permissão"
      });

    }

    const { question } = req.body;

    db.run(
      `
      INSERT INTO questions
      (quiz_id, question)
      VALUES (?, ?)
      `,
      [req.params.quizId, question],

      function(err){

        if(err){
          return res.status(500).json({
            error: err.message
          });
        }

        res.json({
          message:"Pergunta criada"
        });

      }
    );

});



router.get("/:quizId/questions", (req, res) => {

  db.all(
    `
    SELECT *
    FROM questions
    WHERE quiz_id = ?
    `,
    [req.params.quizId],

    (err, questions) => {

      if(err){
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(questions);

    }
  );

});



// ==========================
// ALTERNATIVAS
// ==========================

router.post(
  "/questions/:questionId/options",
  auth,

  (req, res) => {

    const {
      text,
      is_correct
    } = req.body;

    db.run(
      `
      INSERT INTO options
      (question_id, text, is_correct)
      VALUES (?, ?, ?)
      `,
      [
        req.params.questionId,
        text,
        is_correct
      ],

      function(err){

        if(err){
          return res.status(500).json({
            error: err.message
          });
        }

        res.json({
          message:"Alternativa criada"
        });

      }
    );

});



router.get(
  "/questions/:questionId/options",
  (req, res) => {

    db.all(
      `
      SELECT *
      FROM options
      WHERE question_id = ?
      `,
      [req.params.questionId],

      (err, options) => {

        if(err){
          return res.status(500).json({
            error: err.message
          });
        }

        res.json(options);

      }
    );

});



// ==========================
// QUIZ COMPLETO
// ==========================

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



// ==========================
// VALIDAR RESPOSTA
// ==========================

router.get("/check/:optionId", (req, res) => {

  db.get(
    `
    SELECT is_correct
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
        correct: option.is_correct === 1
      });

    }
  );

});



// ==========================
// RESPOSTA CORRETA
// ==========================

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



// ==========================
// RESULTADOS
// ==========================

router.post("/:quizId/result", (req, res) => {

  const {
    player_name,
    score
  } = req.body;

  db.run(
    `
    INSERT INTO results
    (quiz_id, player_name, score)
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

        if(!quiz){

          return res.status(404).json({
            error:"Quiz não encontrado"
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


module.exports = router;