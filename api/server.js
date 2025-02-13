const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Allows JSON body parsing

// MySQL Connection
const db = mysql.createConnection({
  host: "db",
  user: "root",
  password: "PanPloyer@1234",
  database: "Signup_schema",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// API Route to Fetch Data
app.get("/Signup_schema", (req, res) => {
  db.query("SELECT * FROM Signup_schema.Students_info", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// API Route to Insert Data
app.post("/Signup_schema/new_user", (req, res) => {
  const {email, f_name, l_name, password, type, nu_id} = req.body;
  db.query(
    "INSERT INTO Students_info (email, f_name, l_name, password, type, nu_id) VALUES (?, ?, ?, ?, ?, ?)",
    [email, f_name, l_name, password, type, nu_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User added!", userId: result.insertId });
    }
  );
});

// Start Server
app.listen(5001, () => {
  console.log("Server running on http://localhost:5001/Signup_schema");
});