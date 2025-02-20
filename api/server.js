require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // MySQL username from your script
  password: "Pandployer12345!", // MySQL password
  database: "pandployer",
  port: 3306,
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

// gets the users by their email: done so because frontend can query with a body
app.post("/users/email", (req, res) => {
  let {email} = req.body;

  if(!email) {
    return res.status(400).json({error: "Email is required"});
  }

  email = email.toLowerCase().trim();

  // Check if the user already exists
  db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(results[0]);

  });
});



// Add a new user
app.post("/users", (req, res) => {
  const {Email, First_name, Last_name, Affiliation } = req.body;

  // Check if the user already exists
  db.query("SELECT * FROM Users WHERE email = ?", [Email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // If user does not exist, insert the new user
    db.query(
      "INSERT INTO Users (email, f_name, l_name, affiliation) VALUES (?, ?, ?, ?)",
      [Email, First_name, Last_name, Affiliation],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, Email, First_name, Last_name, Affiliation });
      }
    );
  });
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

app.get("/notes", (req, res) => {
  db.query("SELECT * FROM Notes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new note
app.post("/notes", (req, res) => {
  const {Note} = req.body;

  // Check if the student has already made a note already exists
  db.query("SELECT * FROM Users WHERE email = ?", [Email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // If user does not exist, insert the new user
    db.query(
      "INSERT INTO Users (email, f_name, l_name, affiliation) VALUES (?, ?, ?, ?)",
      [Email, First_name, Last_name, Affiliation],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, Email, First_name, Last_name, Affiliation });
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
