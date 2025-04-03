const express = require("express");
const mysql = require("mysql2");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");  // ✅ Add this line at the top


dotenv.config();
const FRONT_URL = process.env.REACT_APP_FRONT_URL;
const app = express();
const http = require("http");  
const { Server } = require("socket.io");

const server = http.createServer(app); // Use HTTP server for Socket.io
const io = new Server(server, {
  cors: {
    origin: `${FRONT_URL}`, // Allow frontend connection
    credentials: true
  }
});


app.use(cors({
  origin: `${FRONT_URL}`,
  credentials: true
}));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/other'; // Default path

    if (file.fieldname === 'jobDescription') {
      uploadPath = 'uploads/jobdescription';
    } else if (file.fieldname === 'resume') {
      uploadPath = 'uploads/resumes';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post("/upload", upload.single("file"), (req, res) => {
  console.log("File received:", req.file);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `${req.file.path}` });
});

app.post('/upload/resume', upload.single('resume'), (req, res) => {
  console.log("File received:", req.file);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `${req.file.path}` });
});

app.post('/upload/job', upload.single('jobDescription'), (req, res) => {
  console.log("File received:", req.file);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `${req.file.path}` });
});

app.delete('/delete/resume/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads/resumes', fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);

    db.query("DELETE FROM Resume_pdfs WHERE file_path = ?", [`uploads/resumes/${fileName}`], (err, result) => {
      if (err) {
        console.error("Database deletion error:", err);
        return res.status(500).json({ error: "Database deletion failed" });
      }
      res.json({ message: `File "${fileName}" deleted successfully.` });
    });
    
  } else {
    res.status(404).send(`File "${fileName}" not found.`);
  }
});

app.delete('/delete/job/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads/jobdescription', fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);

    db.query("DELETE FROM job_descriptions WHERE file_path = ?", [`uploads/jobdescription/${fileName}`], (err, result) => {
      if (err) {
        console.error("Database deletion error:", err);
        return res.status(500).json({ error: "Database deletion failed" });
      }
      res.json({ message: `File "${fileName}" deleted successfully.` });
    });
    
  } else {
    res.status(404).send(`File "${fileName}" not found.`);
  }
});

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

let onlineStudents = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("studentOnline", ({ studentId }) => {
    onlineStudents[studentId] = socket.id;

    // Example: Handle messages from clients
    socket.on("message", (data) => {
      console.log("Received message:", data);

      // Broadcast the message to all connected clients
      io.emit("message", data);
    });

    socket.on("joinGroup", (group_id) => {
      socket.join(group_id);
    });


    socket.on("check", ({ group_id, resume_number, checked }) => {
      db.query(
          "UPDATE Resume SET `checked` = ? WHERE group_id = ? AND resume_number = ?",
          [checked, group_id, resume_number],
          (err, result) => {
              if (err) {
                  console.error("Database Error:", err);
                  return; // Stop execution on error
              }
             
              // Emit only if the update was successful
              socket.to(group_id).emit("checkboxUpdated", { resume_number, checked });
          }
      );
    });

    db.query(
      "SELECT group_id, current_page FROM Users WHERE email = ?",
      [studentId],
      (err, result) => {
        if (!err && result.length > 0) {
          const { group_id, current_page } = result[0];
          console.log(`Student ${studentId} (Group ${group_id}) is on ${current_page}`);

          io.emit("updateOnlineStudents", { studentId, group_id, current_page });
        }
      }
    );
  });

    socket.on("studentPageChanged", ({ studentId, currentPage }) => {
        if (onlineStudents[studentId]) {
            console.log(`Student ${studentId} changed page to ${currentPage}`);
            io.emit("studentPageChange", { studentId, currentPage });
        }
    });

    socket.on("sendPopupToGroups", ({ groups, headline, message }) => {
        if (!groups || groups.length === 0) return;

        db.query(
            "SELECT email FROM Users WHERE group_id IN (?) AND affiliation = 'student'",
            [groups],
            (err, results) => {
                if (!err && results.length > 0) {
                    results.forEach(({ email }) => {
                        const studentSocketId = onlineStudents[email];
                        if (studentSocketId) {
                            io.to(studentSocketId).emit("receivePopup", { headline, message });
                        }
                    });
                    console.log(`Popup sent to Groups: ${groups.join(", ")}`);
                } else {
                    console.log("No online students in the selected groups.");
                }
            }
        );
    });

    socket.on("disconnect", () => {
        Object.keys(onlineStudents).forEach((studentId) => {
            if (onlineStudents[studentId] === socket.id) {
                console.log(`Student ${studentId} disconnected`);
                delete onlineStudents[studentId];
            }
        });
    });
  console.log("A user connected:", socket.id);

  // Example: Handle messages from clients
  socket.on("message", (data) => {
    console.log("Received message:", data);
    
    // Broadcast the message to all connected clients
    io.emit("message", data);
  });

  socket.on("joinGroup", (group_id) => {
    socket.join(group_id);
});


  socket.on("check", ({ group_id, resume_number, checked }) => {
    socket.to(group_id).emit("checkboxUpdated", { resume_number, checked });
});


  // Example: Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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
        return res.redirect("/");
      }
      if (results.length > 0) {
        const user = results[0];
        const fullName = encodeURIComponent(`${user.First_name} ${user.Last_name}`);

        // Check the Affiliation field
        if (user.affiliation === "admin") {
          return res.redirect(`${FRONT_URL}/advisor-dashboard?name=${fullName}`);
        } else {
          return res.redirect(`${FRONT_URL}/dashboard?name=${fullName}`);
        }
      } else {
        return res.redirect(`${FRONT_URL}/signupform?email=${email}`);
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
  res.redirect(`${FRONT_URL}/dashboard?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
});

app.get("/jobdes", (req, res) => { 
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.redirect(`${FRONT_URL}/jobdes?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
});

app.get("/res-review"), (req, res) => { 
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.redirect(`http://localhost:3000/res-review?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
}

app.get("/res-review-group"), (req, res) => {
  if(!req.isAuthenticated()) {
    return res.status(401).json({message: "Unauthorized"});
  }

  res.redirect(`http://localhost:3000/res-review-group?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
}


app.get("/interview-stage"), (req, res) => {
  if(!req.isAuthenticated()) {
    return res.status(401).json({message: "Unauthorized"});
  }

  res.redirect(`http://localhost:3000/interview-stage?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
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
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" }); 
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
  const {student_id, group_id, timespent, resume_number, vote } = req.body;
  
  if (!student_id || !group_id || !resume_number || !timespent || !vote) {
    return res.status(400).json({ error: "student_id, group_id, resume_number, timespent, and vote are required" });
  }

  const query = `INSERT INTO Resume (student_id, group_id, timespent, resume_number, vote) 
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE timespent = VALUES(timespent), vote = VALUES(vote);`;

  db.query(query, [student_id, group_id, timespent, resume_number, vote], (err, result) => {
    if (err){
      console.error(err); 
      return res.status(500).json({error: "Database error"});
    }
    res.status(200).json({ message: "Resume review updated successfully" });
  });

});

app.get("/resume/student/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("SELECT * FROM Resume WHERE student_id = ?", [student_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/resume/group/:group_id", (req, res) => {
  const { group_id } = req.params;
  db.query("SELECT * FROM Resume WHERE group_id = ?", [group_id], (err, results) => {
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

app.post("/resume/check", async (req, res) => {
  const { user_id, group_id, resume_number, checked } = req.body;

  try {
      await db.query(
          "UPDATE resume_votes SET checked = $1 WHERE user_id = $2 AND group_id = $3 AND resume_number = $4",
          [checked, user_id, group_id, resume_number]
      );

      // Emit the checkbox update to the group
      io.to(group_id).emit("checkboxUpdated", { resume_number, checked });

      res.json({ success: true });
  } catch (error) {
      console.error("Error updating checkbox:", error);
      res.status(500).json({ success: false });
  }
});


app.post("/interview/vote", async (req, res) => {

  const {student_id, group_id, question1, question2, question3, question4, timespent, candidate_id} = req.body; 
  
  if (!student_id || !group_id || !question1 || !question2 || !question3 || !question4 || !timespent || !candidate_id) {
    return res.status(400).json({error: "Missing required fields"}); 
  }

    const query = `INSERT INTO InterviewPage 
        (student_id, group_id, question1, question2, question3, question4, timespent, candidate_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; 

    db.query(query, [student_id, group_id, question1, question2, question3, question4, timespent, candidate_id], (err, result) => {
      if (err) {
        console.error(err)
        return res.status(500).json({error: "Database error"}); 
      }
      res.status(200).json({message: "Interview result update successfully"}); 
    });
  });

  app.get("/interview", (req, res) => {
    db.query("SELECT * FROM InterviewPage", (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }); 
  });

  // just to test something with postman 
  app.delete("/interview/:student_id", (req,res) => {
    const { student_id } = req.params;
    db.query("DELETE FROM Interview WHERE student_id = ?", [student_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Interview vote deleted successfully" });
    }); 
  }
);


// Logout route
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
      res.redirect(`${FRONT_URL}`);
  });
});


app.get("/groups", async (req, res) => {
  db.query("SELECT f_name, l_name, email, job_des, current_page, `group_id` FROM Users WHERE `group_id` IS NOT NULL", (err, results) => {
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
        current_page: user.current_page,
        job_des: user.job_des
      });
    });

    res.json(groups);
  });
});

app.get("/students", async (req, res) => {
  db.query("SELECT f_name, l_name, email FROM Users WHERE affiliation != 'admin'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No students found" });

    res.json(results); 
  });
});

app.get("/jobs", (req, res) => {
  db.query("SELECT * FROM job_descriptions", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  }); 
});

app.post("/jobs", async (req, res) => {
  const { title, filePath } = req.body;

  if (!title || !filePath) {
    return res.status(400).json({ error: "Missing title or filePath" });
  }

  try {
    const sql = "INSERT INTO job_descriptions (title, file_path) VALUES (?, ?)";
    await db.query(sql, [title, filePath]);
    res.json({ message: "Job description added successfully!" });
  } catch (error) {
    console.error("Error inserting into DB:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/resume_pdf", (req, res) => {
  db.query("SELECT * FROM Resume_pdfs", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  }); 
});

app.post("/resume_pdf", async (req, res) => {
  const { resTitle, filePath } = req.body;

  if (!resTitle || !filePath) {
    return res.status(400).json({ error: "Missing title or filePath" });
  }

  try {
    const sql = "INSERT INTO Resume_pdfs (title, file_path) VALUES (?, ?)";
    await db.query(sql, [resTitle, filePath]);
    res.json({ message: "resume added successfully!" });
  } catch (error) {
    console.error("Error inserting into DB:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/resume_pdf/:file_path", (req, res) => {
  const { file_path } = req.params;
  db.query("DELETE FROM Resume_pdfs WHERE file_path = ?", [file_path], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Resume deleted successfully" });
  }); 
}
);

app.get("/interview_vids", (req, res) => {
  const sql = `
    SELECT iv.*
    FROM Interview_vids iv
    JOIN Resume r ON iv.resume_id = r.resume_number
    WHERE r.checked = 1
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


app.post("/update-job", (req, res) => {
  const { job_group_id, job } = req.body;

  if (!job_group_id || job.length === 0) {
    return res.status(400).json({ error: "Group ID and job are required." });
  }

  const queries = job.map(title => {
    return new Promise((resolve, reject) => {
      db.query("UPDATE Users SET `job_des` = ? WHERE group_id = ?", [title, job_group_id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  });
}); 

app.get("/jobdes/title", (req, res) => {
  const { title } = req.query; // ✅ Extract from query, not params

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  db.query("SELECT * FROM job_descriptions WHERE title = ?", [title], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: "Job description not found" });
    }

    res.json(results[0]); // ✅ Return only the first result (assuming unique titles)
  });
});


// ✅ Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads/")));


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
  