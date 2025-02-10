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
  password: "Sivakavi@178306",
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
app.get("/test_db.Students", (req, res) => {
  db.query("SELECT * FROM test_db.Students", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// API Route to Insert Data
app.post("/test_db.Students", (req, res) => {
  const {email, f_name, l_name, password, type, nu_id} = req.body;
  db.query(
    "INSERT INTO Students (email, f_name, l_name, password, type, nu_id) VALUES (?, ?, ?, ?, ?, ?)",
    [email, f_name, l_name, password, type, nu_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User added!", userId: result.insertId });
    }
  );
});

// API Route to Update Data
app.put("/test_db.Students/:id", (req, res) => {
  const { id } = req.params;
  const { email, f_name, l_name, password, type, nu_id } = req.body;
  db.query(
    "UPDATE Students SET email = ?, f_name = ?, l_name = ?, password = ?, type = ?, nu_id = ? WHERE id = ?",
    [email, f_name, l_name, password, type, nu_id, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User updated!" });
    }
  );
});

app.delete("/test_db.Students/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Students WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted!" });
  });
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/test_db.Students");
});