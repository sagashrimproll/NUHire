const express = require("express");
const mysql = require("mysql2");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();

// ✅ CORS Middleware (Allow credentials for session cookies)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ✅ Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session Store Configuration
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ✅ Express Session (Must come before Passport!)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { 
    secure: false, // 🔴 Set `true` if using HTTPS
    httpOnly: true, 
    sameSite: "lax"
  }
}));

// ✅ Initialize Passport (Must be after session middleware)
app.use(passport.initialize());
app.use(passport.session());

// ✅ Debugging Middleware
app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  console.log("Authenticated User:", req.user);
  next();
});

// ✅ MySQL Connection
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

// ✅ Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value.toLowerCase();

  db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
    if (err) return done(err);
    if (results.length > 0) {
      return done(null, results[0]); // ✅ User exists
    } else {
      return done(null, { email }); // ✅ New user, return only email
    }
  });
}));

// ✅ Passport Serialization
passport.serializeUser((user, done) => {
  done(null, user.id || user.email);
});

// ✅ Passport Deserialization
passport.deserializeUser((identifier, done) => {
  console.log("Deserializing user:", identifier);
  const query = isNaN(identifier)
    ? "SELECT * FROM Users WHERE email = ?"
    : "SELECT * FROM Users WHERE id = ?";

  db.query(query, [identifier], (err, results) => {
    if (err) return done(err);
    if (results.length === 0) return done(null, false);
    console.log("User found:", results[0]);
    return done(null, results[0]);
  });
});

// ✅ Google OAuth Routes
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
        return res.redirect(`http://localhost:3000/dashboard?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
      } else {
        return res.redirect(`http://localhost:3000/signupform?email=${email}`);
      }
    });
  }
);

// ✅ User Authentication Check Route
app.get("/auth/user", (req, res) => {
  console.log("Checking authentication for user:", req.user);

  if (!req.session.passport || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(req.user);
});

// ✅ Debugging Session Route
app.get("/debug/session", (req, res) => {
  res.json({ session: req.session, user: req.user });
});

// ✅ Logout Route (Updated for Passport v0.6+)
app.get("/auth/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("http://localhost:3000");
    });
  });
});

// ✅ Users API Routes
app.get("/users", (req, res) => {
  db.query("SELECT * FROM Users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/users/:id", (req, res) => {
  db.query("SELECT * FROM Users WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
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

// ✅ Notes API Routes
app.get("/notes", (req, res) => {
  db.query("SELECT * FROM Notes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/notes", (req, res) => {
  const { user_email, content } = req.body;

  if (!user_email || !content) {
    return res.status(400).json({ error: "Email and note content are required" });
  }

  db.query(
    "INSERT INTO Notes (user_email, content, created_at) VALUES (?, ?, NOW())",
    [user_email, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Note saved successfully", id: result.insertId });
    }
  );
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
