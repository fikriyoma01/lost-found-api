const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Konfigurasi CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true 
}));

// Middleware untuk parsing JSON dan urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session({
  secret: process.env.JWT_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }
}));

// Connect flash middleware
app.use(flash());

// Passport Config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Define routes
app.use('/lostitems', require('./routes/lostItems'));
app.use('/founditems', require('./routes/foundItems'));
app.use('/users', require('./routes/users')); 
const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Ini melayani file-file statis dari direktori build jika dalam production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'lost-found-app', 'build', 'index.html'));
  });
}

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send('404 Not Found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
