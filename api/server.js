// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pandployer12345!",
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
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
    db.query("SELECT * FROM Users WHERE id = ?", [id], (err, results) => {
        if (err) return done(err);
        return done(null, results[0]);
    });
});

// Route: Start Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard"); // Redirect user after login
    }
);

// Dashboard route (only accessible when logged in)
app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ message: `Welcome, ${req.user.f_name} ${req.user.l_name}` });
});

// Logout route
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
      // Redirect to frontend with session user info
      res.redirect(`http://localhost:3000/dashboard?email=${req.user.email}`);
  }
);

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
