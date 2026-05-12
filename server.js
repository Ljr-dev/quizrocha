// server.js

const express = require("express");
const path = require("path");
const cors = require("cors");

require("./database/db");

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quizzes");
const adminRoutes = require("./routes/admin");

const app = express();

const PORT = process.env.PORT || 3000;



/* =========================================
   MIDDLEWARES
========================================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended:true
}));



/* =========================================
   STATIC FILES
========================================= */

app.use(
  express.static(
    path.join(__dirname,"public")
  )
);



/* =========================================
   API ROUTES
========================================= */

app.use("/api/auth", authRoutes);

app.use("/api/quizzes", quizRoutes);

app.use("/admin", adminRoutes);



/* =========================================
   HTML ROUTES
========================================= */

app.get("/",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );

});



app.get("/dashboard",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "dashboard.html"
    )
  );

});



app.get("/play/:slug",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "play.html"
    )
  );

});



app.get("/admin-panel",(req,res)=>{

  res.sendFile(
    path.join(
      __dirname,
      "public",
      "admin.html"
    )
  );

});



/* =========================================
   404
========================================= */

app.use((req,res)=>{

  res.status(404).send(`
    <h1
      style="
        font-family:Arial;
        text-align:center;
        margin-top:40px;
      "
    >
      404 | Página não encontrada
    </h1>
  `);

});



/* =========================================
   ERROR
========================================= */

app.use((err,req,res,next)=>{

  console.error(err);

  res.status(500).json({
    success:false,
    error:"Erro interno"
  });

});



/* =========================================
   START
========================================= */

app.listen(PORT,()=>{

  console.log(`
===================================
🚀 QUIZ ROCHA ONLINE
===================================

🌎 URL:
http://localhost:${PORT}

🛡 ADMIN:
http://localhost:${PORT}/admin-panel

===================================
  `);

});