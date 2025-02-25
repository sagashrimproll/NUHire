const express = require("express");       // Web framework for handling requests
const mysql = require("mysql2");           // MySQL connection
const passport = require("passport");     // Authentication middleware
const session = require("express-session"); // Session handling for authentication
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Google OAuth
const dotenv = require("dotenv");         // Load environment variables
const cors = require("cors");             // Handle Cross-Origin Resource Sharing (CORS)
const bodyParser = require("body-parser"); // Parse incoming request bodies


dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware setup
app.use(cors()); // Allows requests from different origins
app.use(bodyParser.json()); // Parses JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded request bodies

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});


db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


app.use(cors({
  origin: "http://localhost:3000", // Allow frontend requests
  credentials: true // Enable cookies for authentication
}));


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



app.post("/users", (req, res) => {
  const { First_name, Last_name, Email, Affiliation } = req.body;

  db.query("SELECT * FROM Users WHERE email = ?", [Email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    db.query(
      "INSERT INTO Users (First_name, Last_name, Email, Affiliation) VALUES (?, ?, ?, ?)",
      [First_name, Last_name, Email, Affiliation],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, First_name, Last_name, Email, Affiliation });
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

// Configure Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value.toLowerCase();

    // Check if user exists in MySQL database
    db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
      if (err) return done(err);

      if (results.length > 0) {
        return done(null, results[0]); // User exists, return user data
      } else {
        // If user does not exist, return email to frontend for further user input
        return done(null, { email });
      }
    });
  } catch (error) {
    return done(error);
  }
}));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.id || user.email);
});

passport.deserializeUser((identifier, done) => {
  const query = isNaN(identifier) ? "SELECT * FROM Users WHERE email = ?" : "SELECT * FROM Users WHERE id = ?";
  db.query(query, [identifier], (err, results) => {
    if (err) return done(err);
    return done(null, results[0]);
  });
});


// Route: Start Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const email = req.user.email;

    db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.redirect("/login?error=server");
      }

      if (results.length > 0) {
        // ✅ User already exists → Redirect to dashboard
        return res.redirect(`/dashboard`);
      } else {
        // 🆕 New user → Redirect to signup details form
        return res.redirect(`http://localhost:3000/signupform?email=${email}`);
      }
    });
  }
);



app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Redirect to frontend dashboard with user data
  res.redirect(`http://localhost:3000/dashboard?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
});

// Logout route
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

// Route to fetch authenticated user details
app.get("/auth/user", (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(req.user);
});

// Logout route
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
      res.redirect("http://localhost:3000");
  });
});
