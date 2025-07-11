//Importing necessary modules and packages
const express = require("express"); //Api framework
const mysql = require("mysql2"); //MySQL database driver
const passport = require("passport"); //Authentication middleware
const session = require("express-session"); //Session management middleware, which is used for creating and managing user sessions
const KeycloakStrategy = require('passport-keycloak-oauth2-oidc').Strategy; // Keycloak authentication strategy for Passport
const dotenv = require("dotenv");// dotenv package to load environment variables from a .env file into process.env
const cors = require("cors"); //CORS middleware for enabling Cross-Origin Resource Sharing
const bodyParser = require("body-parser"); //Middleware for parsing incoming request bodies in a middleware before your handlers, available under the req.body property.
const multer = require("multer"); //Middleware for handling multipart/form-data, which is primarily used for uploading files
const fs = require("fs"); //File system module for interacting with the file system
const path = require("path");  // Path module for working with file and directory paths
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Load environment variables from .env file, creates an express server, and sets up Socket.io
dotenv.config();
const FRONT_URL = process.env.REACT_APP_FRONT_URL;
const app = express();
const http = require("http");
const { Server } = require("socket.io");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const server = http.createServer(app); // Use HTTP server for Socket.io
const io = new Server(server, {
  cors: {
    origin: `${FRONT_URL}`, // Allow frontend connection
    credentials: true // Allow credentials which is required for cookies
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//configure CORS to allow requests from the frontend URL
app.use(cors({
  origin: `${FRONT_URL}`,
  credentials: true
}));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Set up EJS as the templating engine, which is used for rendering dynamic HTML pages
app.set('view engine', 'ejs');

// Set the views directory for EJS templates, which is where the EJS files are located
app.set('views', path.join(__dirname, 'views'));

//Sets up the file storage for Multer, which is used for handling file uploads. It specifies the destination directory and filename format for uploaded files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    let uploadPath = 'uploads/other'; // Default path

    // Set the upload path based on the field name
    if (file.fieldname === 'jobDescription') {
      uploadPath = 'uploads/jobdescription';
    } else if (file.fieldname === 'resume') {
      uploadPath = 'uploads/resumes';
    }

    // Create the directory if it doesn't exist
    cb(null, uploadPath);
  },

  // Set the filename format for uploaded files
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

// Serve static files from the uploads directory, which is where the uploaded files are stored
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Post route for uploading files, which handles the file upload and returns the file path in the response
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("File received:", req.file);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `${req.file.path}` });
});

// Post route for uploading resumes, which handles the file upload and returns the file path in the response
app.post('/upload/resume', upload.single('resume'), (req, res) => {
  console.log("File received:", req.file);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `${req.file.path}` });
});

// Post route for uploading job descriptions, which handles the file upload and returns the file path in the response
app.post('/upload/job', upload.single('jobDescription'), (req, res) => {
  console.log("File received:", req.file);
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ filePath: `${req.file.path}` });
});

// Delete route for deleting files, which removes the file from the server and deletes its record from the database
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

// Delete route for deleting job description files, which removes the file from the server and deletes its record from the database
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Middleware for parsing JSON and URL-encoded data in incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for parsing cookies in incoming requests
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Middleware for session management, which creates a session for each user and stores it in the MySQL database
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

// Middleware for initializing Passport.js, which is used for user authentication
app.use(passport.initialize());
app.use(passport.session());

// Middleware for logging session data and authenticated user information for debugging purposes
app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  console.log("Authenticated User:", req.user);
  next();
});

// Replace your current database connection setup
function connectToDatabase() {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to connect to MySQL at ${process.env.DB_HOST}...`);
    console.log(`Connection details: host=${process.env.DB_HOST}, user=${process.env.DB_USER}, database=${process.env.DB_NAME}`);
    
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectTimeout: 20000 // Increase timeout to 20 seconds
    });
    
    connection.connect((err) => {
      if (err) {
        console.error('Database connection failed:', err);
        reject(err);
      } else {
        console.log('Connected to MySQL database successfully!');
        resolve(connection);
      }
    });
    
    connection.on('error', (err) => {
      console.error('Database error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost. Reconnecting...');
        global.db = connectToDatabase().catch(console.error);
      } else {
        throw err;
      }
    });
  });
}

// Global database variable
let db;

// Initialize the application
async function initializeApp() {
  // Try to connect to the database with retries
  let connected = false;
  let retryCount = 0;
  const maxRetries = 30;
  
  while (!connected && retryCount < maxRetries) {
    try {
      db = await connectToDatabase();
      global.db = db; // Make it globally available
      connected = true;
      console.log("Database connection established successfully");
    } catch (error) {
      retryCount++;
      console.error(`Database connection attempt ${retryCount} failed:`, error);
      
      if (retryCount < maxRetries) {
        const delay = Math.min(10000, retryCount * 1000);
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All database connection attempts failed. Exiting application.');
        process.exit(1);
      }
    }
  }
  
  // Configure passport after database is connected
  configurePassport();
  
  const PORT = process.env.PORT || 5001;
  // Start the server only after database is connected
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Separate passport configuration function
function configurePassport() {
  // Passport.js configuration for Keycloak authentication
  passport.use(new KeycloakStrategy({
    clientID: process.env.KEYCLOAK_CLIENT_ID,
    realm: process.env.KEYCLOAK_REALM,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    sslRequired: 'external',
    authServerURL: process.env.KEYCLOAK_URL,
    callbackURL: '/auth/callback'
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
  
  app.get('/auth/keycloak', passport.authenticate('keycloak'));

  app.get('/auth/callback',
    passport.authenticate('keycloak', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/'));
  

  // serializeUser and deserializeUser methods
  passport.serializeUser((user, done) => {
    done(null, user.id || user.email);
  });
  
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
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Socket.io configuration for real-time communication between the server and clients

// Store online students in an object, which keeps track of connected students and their socket IDs
let onlineStudents = {};

// Listen for incoming connections from clients
// When a client connects, the server logs the connection and sets up event listeners for various events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  console.log(`User connected: ${socket.id}`);

  // Listen for the "studentOnline" event, which is emitted by the client when a student comes online
  socket.on("studentOnline", ({ studentId }) => {
    onlineStudents[studentId] = socket.id;

    // Listen for the "message" event, which is emitted by the client when a message is sent
    // The server logs the message and broadcasts it to all connected clients
    socket.on("message", (data) => {
      console.log("Received message:", data);

      // Broadcast the message to all connected clients
      io.emit("message", data);
    });

    // Query the database to get the group ID and current page for the student
    // The server emits the "updateOnlineStudents" event to all connected clients with the student's information
    db.query("SELECT group_id, current_page FROM Users WHERE email = ?", [studentId], (err, result) => {
      if (!err && result.length > 0) {
        const { group_id, current_page } = result[0];
        console.log(`Student ${studentId} (Group ${group_id}) is on ${current_page}`);

        io.emit("updateOnlineStudents", { studentId, group_id, current_page });
      }
    });


  });

  // Listen for the "joinGroup" event, which is emitted by the client when a student joins a group
  // The server adds the student to the specified group room
  socket.on("joinGroup", (group_id) => {
    socket.join(group_id);
  });

  // Listen for the "check" event, which is emitted by the client when a checkbox is checked or unchecked
  // The server emits the checkbox update to all clients in the specified group room    
  // Listen for the "check" event
  socket.on("check", ({ group_id, resume_number, checked }) => {
    // Extract class information from the group_id if it contains the new format
    let actualGroupId = group_id;
    let classId = null;
    
    // Check if the group_id is in the format "group_X_class_Y"
    const roomMatch = /group_(\d+)_class_(\d+)/.exec(group_id);
    if (roomMatch) {
        actualGroupId = roomMatch[1]; // The actual group ID
        classId = roomMatch[2];       // The class ID
    }
    
    // Update the database - removed commas between WHERE conditions and removed AND
    const query = classId 
      ? "UPDATE Resume SET `checked` = ? WHERE group_id = ? AND class = ? AND resume_number = ?"
      : "UPDATE Resume SET `checked` = ? WHERE group_id = ? AND resume_number = ?";
      
    const params = classId 
      ? [checked, actualGroupId, classId, resume_number]
      : [checked, actualGroupId, resume_number];
    
    db.query(query, params, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return; // Stop execution on error
        }
        
        // Emit the update to all clients in the same room
        socket.to(group_id).emit("checkboxUpdated", { resume_number, checked });
    });
  });

  // Listen for the "checkint" event, which is emitted by the client when a checkbox in the make offer stage is checked or unchecked
  socket.on("checkint", ({ group_id, interview_number, checked }) => {
    socket.to(group_id).emit("checkboxUpdated", { interview_number, checked });
  });

  // Listen for the "studentPageChanged" event, which is emitted by the client when a student changes their page
  socket.on("studentPageChanged", ({ studentId, currentPage }) => {
    if (onlineStudents[studentId]) {
      console.log(`Student ${studentId} changed page to ${currentPage}`);
      io.emit("studentPageChange", { studentId, currentPage });
    }
  });

  // Listen for the "sendPopupToGroups" event, which is emitted by the client when an admin wants to send a popup message to specific groups
  // The server queries the database to get the email addresses of students in the specified groups
  socket.on("sendPopupToGroups", ({ groups, headline, message, class: classId }) => {
    if (!groups || groups.length === 0) return;
  
    let query = "SELECT email FROM Users WHERE group_id IN (?) AND affiliation = 'student'";
    let params = [groups];
    
    if (classId) {
      query += " AND class = ?";
      params.push(classId);
    }
  
    db.query(query, params, (err, results) => {
      if (!err && results.length > 0) {
        results.forEach(({ email }) => {
          const studentSocketId = onlineStudents[email];
          if (studentSocketId) {
            io.to(studentSocketId).emit("receivePopup", { headline, message });
          }
        });
  
        console.log(`Popup sent to Groups: ${groups.join(", ")} in Class ${classId || 'All'}`);
      } else {
        console.log("No online students in the selected groups.");
      }
    });
  });

  // Listen for the "makeOfferRequest" event, which is emitted by the client when a student group wants to make an offer to a candidate
  socket.on("makeOfferRequest", ({classId, groupId, candidateId }) => {
    console.log(`Student in class ${classId}, group ${groupId} wants to offer candidate ${candidateId}`);
    io.emit("makeOfferRequest", {classId, groupId, candidateId});
  });

  // Advisor’s decision → notify the student group
  socket.on('makeOfferResponse', ({classId, groupId, candidateId, accepted }) => {
    console.log(`Advisor responded to class ${classId}, group ${groupId} for candidate ${candidateId}: accepted=${accepted}`);
    io.emit('makeOfferResponse', {classId, groupId, candidateId, accepted });
  });

  // Listens for the "disconnect" event, which is emitted when a client disconnects from the server
  // The server removes the student from the onlineStudents object and emits the "updateOnlineStudents" event to all connected clients
  socket.on("disconnect", () => {
    Object.keys(onlineStudents).forEach((studentId) => {
      if (onlineStudents[studentId] === socket.id) {
        console.log(`Student ${studentId} disconnected`);
        delete onlineStudents[studentId];
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Keycloak OAuth authentication routes

// The "/auth/keycloak" route initiates the authentication process by redirecting the user to the keycloak login page
app.get('/auth/keycloak', passport.authenticate('keycloak'));

// The "/auth/callback" route is the callback URL that keycloak redirects to after the user has authenticated
// The server handles the authentication response and checks if the user exists in the database
app.get("/auth/callback",
  passport.authenticate('keycloak', { failureRedirect: '/' }),
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

//check if the user is authenticated and return the user information
app.get("/auth/user", (req, res) => {
  console.log("Checking authentication for user:", req.user);

  if (!req.session.passport || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(req.user);
});

// logout route for logging out the user and destroying the session
// The server clears the session and redirects the user to the home page
// logout route for logging out the user and destroying the session
// The server clears the session and redirects the user to the home page
app.post("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
      res.redirect(`${FRONT_URL}`);
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes for serving the frontend application

// get route for the dashboard page, which checks if the user is authenticated and redirects them to the frontend student dashboard with their name as a query parameter
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Redirect to frontend dashboard with user data
  res.redirect(`${FRONT_URL}/dashboard?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
});

//get route for the job description page, which checks if the user is authenticated and redirects them to the frontend job description page with their name as a query parameter
app.get("/jobdes", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.redirect(`${FRONT_URL}/jobdes?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
});

// get route for the resume review page, which checks if the user is authenticated and redirects them to the frontend resume review page with their name as a query parameter
app.get("/res-review"), (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.redirect(`${FRONT_URL}/res-review?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
}

//get route for the group resume review page, which checks if the user is authenticated and redirects them to the frontend group resume review page with their name as a query parameter
app.get("/res-review-group"), (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.redirect(`${FRONT_URL}/res-review-group?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
}

// get route for the interview stage page, which checks if the user is authenticated and redirects them to the frontend interview stage page with their name as a query parameter
app.get("/interview-stage"), (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.redirect(`${FRONT_URL}/interview-stage?name=${encodeURIComponent(req.user.f_name + " " + req.user.l_name)}`);
}

// Logout route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Routes for handling stored data user data

// get route for user data, which checks if the user is authenticated and retrieves all users from the database
app.get("/users", (req, res) => {
  db.query("SELECT * FROM Users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//get route which gets a specific user by their ID from the database
app.get("/users/:id", (req, res) => {
  db.query("SELECT * FROM Users WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

// post route for creating a new user, which checks if the user already exists in the database and inserts a new user record if not
app.post("/users", (req, res) => {
  const { First_name, Last_name, Email, Affiliation, group_id, course_id } = req.body;

  // Validate required fields
  if (!First_name || !Last_name || !Email || !Affiliation) {
    return res.status(400).json({ message: "First name, last name, email, and affiliation are required" });
  }

  // Check if user already exists
  db.query("SELECT * FROM Users WHERE email = ?", [Email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create SQL query based on whether group_id is provided
    let sql, params;
    
    if (Affiliation === 'student' && group_id && course_id) {
      // Include group_id for students
      sql = "INSERT INTO Users (f_name, l_name, email, affiliation, group_id, class) VALUES (?, ?, ?, ?, ?, ?)";
      params = [First_name, Last_name, Email, Affiliation, group_id, course_id];
    } else {
      // Don't include group_id for faculty
      sql = "INSERT INTO Users (f_name, l_name, email, affiliation) VALUES (?, ?, ?, ?)";
      params = [First_name, Last_name, Email, Affiliation];
    }
    
    // Execute the query
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("Failed to create user:", err);
        return res.status(500).json({ error: err.message });
      }
      
      // Log successful user creation
      console.log(`User created: ${First_name} ${Last_name} (${Email}) as ${Affiliation}${group_id ? `, group: ${group_id}` : ''}${course_id ? `, class: ${course_id}` : ''}`);
      
      // Return success response
      res.status(201).json({ 
        id: result.insertId, 
        First_name, 
        Last_name, 
        Email, 
        Affiliation,
        ...(group_id && { group_id }),
        ...(course_id && { course_id }) 
      });
    });
  });
});

// Get all unique classes from the database
app.get("/classes", (req, res) => {
  db.query("SELECT DISTINCT class AS id, class AS name FROM Users WHERE class IS NOT NULL ORDER BY class", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.length ? results : []);
  });
});

// Update the students endpoint to filter by class
app.get("/students", async (req, res) => {
  const { class: classId } = req.query;
  
  let query = "SELECT f_name, l_name, email FROM Users WHERE affiliation = 'student'";
  let params = [];
  
  if (classId) {
    query += " AND class = ?";
    params.push(classId);
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No students found" });
    res.json(results);
  });
});

// post route for updating the current page of a user, which checks if the page and user email are provided in the request body
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

//Updates a group of Users stored job description as long as it's given the id of the group and the job descrption title
app.post("/update-job", (req, res) => {
  const { job_group_id, class_id, job } = req.body;

  if (!job_group_id || job.length === 0) {
    return res.status(400).json({ error: "Group ID and job are required." });
  }

  const queries = job.map(title => {
    return new Promise((resolve, reject) => {
      db.query("UPDATE Users SET `job_des` = ? WHERE group_id = ? AND class = ?", [title, job_group_id, class_id], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  });
});

// Update user's class
app.post("/update-user-class", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, class: classId } = req.body;
  
  // Verify the user is updating their own data
  if (req.user.email !== email && req.user.affiliation !== "admin") {
    return res.status(403).json({ message: "Forbidden: You can only update your own profile" });
  }

  if (!email || !classId) {
    return res.status(400).json({ error: "Email and class are required." });
  }

  
  db.query("UPDATE Users SET `class` = ? WHERE email = ?", [classId, email], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to update class." });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    
    res.json({ message: "Class updated successfully!" });
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Notes API Routes

// get route for retrieving all notes from the database
app.get("/notes", (req, res) => {
  db.query("SELECT * FROM Notes", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// post route for creating a new note, which checks if the user email and note content are provided in the request body
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Group API Routes

// get route for retrieving all groups from the database
app.get("/groups", async (req, res) => {
  const { class: classId } = req.query;
  
  let query = "SELECT f_name, l_name, email, job_des, current_page, `group_id` FROM Users WHERE `group_id` IS NOT NULL";
  let params = [];
  
  if (classId) {
    query += " AND class = ?";
    params.push(classId);
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "No users found in any group" });

    // Group users by `group`
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

// post route for updating the group of students, which checks if the group ID and students are provided in the request body
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resume API Routes

// get route for retrieving all resumes from the database
app.get("/resume", (req, res) => {
  db.query("SELECT * FROM Resume", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//post route for submitting a resume vote, which checks if the required fields are provided in the request body
app.post("/resume/vote", (req, res) => {
  const { student_id, group_id, class: classId, timespent, resume_number, vote } = req.body;

  if (!student_id || !group_id || !classId || !resume_number || !timespent || !vote) {
    return res.status(400).json({ 
      error: "student_id, group_id, class, resume_number, timespent, and vote are required" 
    });
  }

  const query = `INSERT INTO Resume (student_id, group_id, class, timespent, resume_number, vote) 
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE timespent = VALUES(timespent), vote = VALUES(vote);`;

  db.query(query, [student_id, group_id, classId, timespent, resume_number, vote], (err, result) => {
    if (err) {
      console.error("Error saving vote:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    console.log(`Vote recorded for resume ${resume_number} by student ${student_id} in group ${group_id}, class ${classId}`);
    res.status(200).json({ message: "Resume review updated successfully" });
  });
});

// get route for retriving all of the resume submissions made by a specific student, given their id.
app.get("/resume/student/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("SELECT * FROM Resume WHERE student_id = ?", [student_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// delete route for deleting a resume submission, which checks if the student ID is provided in the request parameters
app.delete("/resume/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("DELETE FROM Resume WHERE student_id = ?", [student_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Resume deleted successfully" });
  });
});

// Update the existing endpoint to support class filtering
app.get("/resume/group/:group_id", (req, res) => {
  const { group_id } = req.params;
  const { class: studentClass } = req.query;
  
  let query = "SELECT * FROM Resume WHERE group_id = ?";
  let params = [group_id];
  
  // If class is provided, add it to the query
  if (studentClass) {
    // You'll need to join with the Users table to filter by class
    query = `
      SELECT r.* 
      FROM Resume r
      JOIN Users u ON r.student_id = u.id
      WHERE r.group_id = ? AND u.class = ?
    `;
    params = [group_id, studentClass];
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// post route for checking a resume, which checks if the user ID, group ID, resume number, and checked status are provided in the request body
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

//get route for getting all resumes that have been checked by a group, given their id.
app.get("/resume/checked/:group_id", async (req, res) => {
  const { group_id } = req.params;
  db.query("SELECT vote, resume_number FROM Resume WHERE group_id = ? AND checked == 'True'", [group_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interview API Routes

//post route for submitting an interview vote, which checks if the required fields are provided in the request body
app.post("/interview/vote", async (req, res) => {

  const { student_id, group_id, studentClass, question1, question2, question3, question4, timespent, candidate_id } = req.body;

  if (!student_id || !group_id || !studentClass || !question1 || !question2 || !question3 || !question4 || !timespent || !candidate_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
  INSERT INTO InterviewPage
    (student_id, group_id, class, question1, question2, question3, question4, timespent, candidate_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    question1 = VALUES(question1),
    question2 = VALUES(question2),
    question3 = VALUES(question3),
    question4 = VALUES(question4),
    timespent  = VALUES(timespent)
`;

  db.query(query, [student_id, group_id, studentClass, question1, question2, question3, question4, timespent, candidate_id], (err, result) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Interview result update successfully" });
  });
});

//get route for getting all stored interview votes
app.get("/interview", (req, res) => {
  db.query("SELECT * FROM InterviewPage", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// get route for retrieving all interviews submitted by a specific group, given their id.
app.get("/interview/group/:group_id", (req, res) => {
  const { group_id } = req.params;
  const { class: studentClass } = req.query;
  
  let query = "SELECT * FROM InterviewPage WHERE group_id = ?";
  let params = [group_id];
  
  // If class is provided, add it to the query
  if (studentClass) {
    // You'll need to join with the Users table to filter by class
    query = `
      SELECT r.* 
      FROM InterviewPage r
      JOIN Users u ON r.student_id = u.id
      WHERE r.group_id = ? AND u.class = ?
    `;
    params = [group_id, studentClass];
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// delete route for deleting an interview vote, which checks if the student ID is provided in the request parameters
app.delete("/interview/:student_id", (req, res) => {
  const { student_id } = req.params;
  db.query("DELETE FROM Interview WHERE student_id = ?", [student_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Interview vote deleted successfully" });
  });
}
);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interview Videos API Routes

// get route for retrieving all interview videos from the database
app.get("/interview-vids", (req, res) => {
  db.query("SELECT * FROM Interview_vids", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Job Description API routes

// Gets all the stored job decriptions 
app.get("/jobs", (req, res) => {
  db.query("SELECT * FROM job_descriptions", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//Posts a new job description into the database taking in the jobs title and file path
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

// Gets a specific job description by its title
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Resume(stored pdfs) API routes

//Gets all stored resumes
app.get("/resume_pdf", (req, res) => {
  db.query("SELECT * FROM Resume_pdfs", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//Posts a new resume into the database as long as it's given the resume title and the file path
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


//Deletes a stored resume as long as it's given the resumes file path
app.delete("/resume_pdf/:file_path", (req, res) => {
  const { file_path } = req.params;
  db.query("DELETE FROM Resume_pdfs WHERE file_path = ?", [file_path], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Resume deleted successfully" });
  });
}
);

//Deletes a stored resume as long as it's given the resumes file path
app.get("/resume_pdf/id/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM Resume_pdfs WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
}
);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Canidates API routes

// get route for retrieving all candidates from the database
app.get("/canidates", (req, res) => {
  db.query("SELECT * FROM Candidates", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//get route to get a list canidates by their ids
app.get("/canidates/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM Candidates WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

//get route to get a list canidates by their ids
app.get("/canidates/resume/:resume_number", (req, res) => {
  const { resume_number } = req.params;
  db.query("SELECT * FROM Candidates WHERE resume_id = ?", [resume_number], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Various

// ✅ Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads/")));

//Initializes the server and database connection
initializeApp().catch(error => {
  console.error("Failed to initialize app:", error);
  process.exit(1);
});