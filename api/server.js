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
    secure: false, // Set `true` if using HTTPS
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
      return done(null, results[0]);
    } else {
      return done(null, { email });
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
        const user = results[0];
        const fullName = encodeURIComponent(`${user.First_name} ${user.Last_name}`);

        // Check the Affiliation field
        if (user.affiliation === "admin") {
          return res.redirect(`http://localhost:3000/advisor-dashboard?name=${fullName}`);
        } else {
          return res.redirect(`http://localhost:3000/dashboard?name=${fullName}`);
        }
      } else {
        return res.redirect(`http://localhost:3000/signupform?email=${email}`);
      }
    });
  }
);


// ✅ User Authentication Check Route
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Redirect to frontend dashboard with user data
  res.redirect(`http://localhost:3000/dashboard?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
});

app.get("/jobdes"), (req, res) => { 
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.redirect(`http://localhost:3000/jobdes?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
}

// Logout route
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

// Route to fetch authenticated user details
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
app.post("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // ✅ Clears session cookie
      res.status(200).json({ message: "Logged out successfully" }); // ✅ Sends JSON response
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
      "INSERT INTO Users (f_name, l_name, email, affiliation) VALUES (?, ?, ?, ?)",
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

app.post("/update-group", (req, res) => {
  const { group_id, students } = req.body;

  if (!group_id || students.length === 0) {
    return res.status(400).json({ error: "Group ID and students are required." });
  }

  const queries = students.map(email => {
    return new Promise((resolve, reject) => {
      db.query("UPDATE Users SET `group_id` = ? WHERE email = ?", [group_id, email], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  });

  Promise.all(queries)
    .then(() => res.json({ message: "Group updated successfully!" }))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.post("/update-currentpage", (req, res) => {
  const { page, user_email } = req.body;

  if (!page || !user_email) {
    return res.status(400).json({ error: "Page and email are required." });
  }

  db.query("UPDATE Users SET `current_page` = ? WHERE email = ?", [page, user_email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to update current page." });
    }
    res.json({ message: "Page updated successfully!" });
  }
  );
});


app.post("/resume/vote", (req, res) => {
  const {student_id, timespent, resume_number, vote } = req.body;
  
  if (!student_id || !resume_number || !timespent || !vote) {
    return res.status(400).json({ error: "student_id, resume_number, timespent, and vote are required" });
  }

  const query = `INSERT INTO Resume (student_id, timespent, resume_number, vote) 
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE timespent = VALUES(timespent), vote = VALUES(vote);`;

  db.query(query, [student_id, timespent, resume_number, vote], (err, result) => {
    if (err){
      console.error(err); 
      return res.status(500).json({error: "Database error"});
    }
    res.status(200).json({ message: "Resume review updated successfully" });
  });

});

app.get("/resume/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("SELECT * FROM Resume WHERE student_id = ?", [student_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/resume", (req, res) => {
  db.query("SELECT * FROM Resume", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/resume/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("DELETE FROM Resume WHERE student_id = ?", [student_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Resume deleted successfully" });
  }); 
}
);

// Logout route
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
      res.redirect("http://localhost:3000");
  });
});


app.get("/groups", async (req, res) => {
  db.query("SELECT f_name, l_name, email, current_page, `group_id` FROM Users WHERE `group_id` IS NOT NULL", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No users found in any group" });

    // ✅ Group users by `group`
    const groups = {};
    results.forEach(user => {
      if (!groups[user.group_id]) {
        groups[user.group_id] = [];
      }
      groups[user.group_id].push({
        name: `${user.f_name} ${user.l_name}`,
        email: user.email,
        current_page: user.current_page
      });
    });

    res.json(groups);
  });
});

app.get("/students", async (req, res) => {
  db.query("SELECT f_name, l_name, email FROM Users WHERE affiliation != 'admin'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No students found" });

    res.json(results); // ✅ Just return the filtered users
  });
});





// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
