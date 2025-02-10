const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Allows JSON body parsing

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "test_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// API Route to Fetch Data
app.get("/Students", (req, res) => {
  db.query("SELECT * FROM Students", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// API Route to Insert Data
app.post("/users", (req, res) => {
  const {email, first_name, last_name, password, type, nu_id} = req.body;
  db.query(
    "INSERT INTO Students (email, f_name, l_name, password,  type, nu_id) VALUES (?, ?, ?, ?, ?, ?)",
    [email, first_name, last_name, password, type, nu_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User added!", userId: result.insertId });
    }
  );
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});