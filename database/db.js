const Database =
  require("better-sqlite3");

const db = new Database(
  "./database/database.sqlite"
);



// USERS
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`).run();



// QUIZZES
db.prepare(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    slug TEXT UNIQUE,
    is_public INTEGER DEFAULT 1,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();



// QUESTIONS
db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    question TEXT
  )
`).run();



// OPTIONS
db.prepare(`
  CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    text TEXT,
    is_correct INTEGER
  )
`).run();



// RESULTS
db.prepare(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    player_name TEXT,
    score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();



module.exports = db;