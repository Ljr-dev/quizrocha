const express = require("express");

const path = require("path");

const cors = require("cors");

require("./database/db");

const app = express();

app.use(cors());

app.use(express.json());



app.use(
  express.static(
    path.join(__dirname, "public")
  )
);



const authRoutes =
  require("./routes/auth");

const quizRoutes =
  require("./routes/quizzes");



app.use("/api/auth", authRoutes);

app.use("/api/quizzes", quizRoutes);



// PLAY SLUG
app.get(
  "/play/:slug",
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "public/play.html"
      )
    );

});



// INDEX
app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "public/index.html"
    )
  );

});



const PORT = 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );

});