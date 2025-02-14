require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // MySQL username from your script
  password: "Pandployer12345!", // MySQL password
  database: "pandployer",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});


app.get("/users", (req, res) => {
  db.query("SELECT * FROM Users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// Get user by ID
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM Users WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

// Add a new user
app.post("/users", (req, res) => {
  const { First_name, Last_name, Email, Affiliation } = req.body;
  db.query(
    "INSERT INTO Users (First_name, Last_name, Email, Affiliation) VALUES (?, ?, ?, ?)",
    [First_name, Last_name, Email, Affiliation],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, First_name, Last_name, Email, Affiliation });
    }
  );
});

// Update user
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { First_name, Last_name, Email, Affiliation } = req.body;
  db.query(
    "UPDATE Users SET First_name = ?, Last_name = ?, Email = ?, Affiliation = ? WHERE id = ?",
    [First_name, Last_name, Email, Affiliation, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "User updated successfully" });
    }
  );
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Users WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
