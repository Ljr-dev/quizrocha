const jwt = require("jsonwebtoken");

const SECRET = "quizrocha_secret";

function auth(req, res, next){

  try{

    const authHeader =
      req.headers.authorization;

    if(!authHeader){

      return res.status(401).json({
        error:"Token não enviado"
      });

    }

    const parts =
      authHeader.split(" ");

    if(parts.length !== 2){

      return res.status(401).json({
        error:"Token mal formatado"
      });

    }

    const [scheme, token] = parts;

    if(!/^Bearer$/i.test(scheme)){

      return res.status(401).json({
        error:"Token mal formatado"
      });

    }

    const decoded =
      jwt.verify(token, SECRET);

    req.user = decoded;

    next();

  }catch(err){

    return res.status(401).json({
      error:"Token inválido"
    });

  }

}

module.exports = auth;